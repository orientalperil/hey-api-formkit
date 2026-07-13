/**
 * A custom `@hey-api/openapi-ts` plugin that emits FormKit schema arrays.
 *
 * For every object schema in the spec it writes an exported
 * `<Name>FormKitSchema` constant to `src/client/formkit.gen.ts`. Because this
 * runs at generation time with the whole spec graph in hand, `$ref`s (e.g. the
 * `status` enum) are resolved and inlined — no runtime ref resolution needed.
 *
 * @see https://heyapi.dev/openapi-ts/plugins (custom plugins)
 * @see https://formkit.com/essentials/schema
 */
import { $, definePluginConfig } from "@hey-api/openapi-ts"
import type { DefinePlugin, PluginInstance } from "@hey-api/openapi-ts"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface FormKitPluginConfig {
  name: string
}

// External symbols this plugin registers, exposed via `plugin.imports`.
type FormKitImports = {
  FormKitSchemaNode: ReturnType<PluginInstance["symbolFactory"]["register"]>
}

type FormKitPlugin = DefinePlugin<FormKitPluginConfig, FormKitPluginConfig, never, FormKitImports>

// ---------------------------------------------------------------------------
// JSON Schema -> FormKit schema conversion (runs at build time)
// ---------------------------------------------------------------------------

// Loosely-typed view of the raw OpenAPI schema objects in the spec.
type Schema = Record<string, unknown>
type FormKitNode = Record<string, unknown>

/** "customer_name" -> "Customer name" */
function humanize(name: string): string {
  const spaced = name.replace(/_/g, " ")
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Resolve a local `$ref` (e.g. `#/components/schemas/StatusEnum`). */
function deref(schema: Schema, schemas: Record<string, Schema>): Schema {
  if (typeof schema?.$ref === "string") {
    const name = schema.$ref.split("/").pop() as string
    return { ...schemas[name], ...schema, $ref: undefined }
  }
  return schema
}

/** Map a single property to a FormKit `$formkit` node. */
function propertyToNode(
  name: string,
  rawProp: Schema,
  isRequired: boolean,
  schemas: Record<string, Schema>,
): FormKitNode {
  const prop = deref(rawProp, schemas)
  const node: FormKitNode = { $formkit: "text", name, label: humanize(name) }
  const validation: string[] = []
  if (isRequired) validation.push("required")

  if (Array.isArray(prop.enum)) {
    node.$formkit = "select"
    node.options = prop.enum.map((value: string) => ({ value, label: humanize(String(value)) }))
  } else if (prop.type === "boolean") {
    node.$formkit = "checkbox"
  } else if (prop.type === "integer" || prop.type === "number") {
    node.$formkit = "number"
    if (typeof prop.minimum === "number") validation.push(`min:${prop.minimum}`)
    if (typeof prop.maximum === "number") validation.push(`max:${prop.maximum}`)
  } else {
    switch (prop.format) {
      case "email":
        node.$formkit = "email"
        validation.push("email")
        break
      case "decimal": // DRF serializes decimals as strings; validate as a number.
        node.$formkit = "text"
        validation.push("number")
        break
      case "date-time":
        node.$formkit = "datetime-local"
        break
      default:
        node.$formkit = "text"
    }
    if (typeof prop.maxLength === "number") validation.push(`length:0,${prop.maxLength}`)
  }

  if (validation.length) node.validation = validation.join("|")
  return node
}

/** Convert one object schema into an array of FormKit nodes (skips read-only). */
function objectToFormKitSchema(schema: Schema, schemas: Record<string, Schema>): FormKitNode[] {
  const required: string[] = Array.isArray(schema.required) ? schema.required : []
  const nodes: FormKitNode[] = []

  for (const [name, rawProp] of Object.entries(schema.properties ?? {})) {
    const prop = deref(rawProp as Schema, schemas)
    if (prop.readOnly) continue

    if (prop.type === "array" && prop.items) {
      // Repeatable list of object items, emitted as a `repeater` input. The
      // repeater owns its own row array and add/remove controls at runtime, so
      // the fields render directly as its children
      const itemSchema = deref(prop.items as Schema, schemas)
      const itemFields = objectToFormKitSchema(itemSchema, schemas)
      const repeater: FormKitNode = { $formkit: "repeater", name, children: itemFields }
      if (typeof prop.minItems === "number") repeater.min = prop.minItems
      if (typeof prop.maxItems === "number") repeater.max = prop.maxItems
      nodes.push(repeater)
      continue
    }

    nodes.push(propertyToNode(name, rawProp as Schema, required.includes(name), schemas))
  }

  return nodes
}

// ---------------------------------------------------------------------------
// Plugin handler
// ---------------------------------------------------------------------------

const handler = ({ plugin }: { plugin: FormKitPlugin["Instance"] }) => {
  const spec = plugin.context.spec as { components?: { schemas?: Record<string, Schema> } }
  const schemas = spec.components?.schemas
  if (!schemas) return

  // `Array<FormKitSchemaNode>` (imported from '@formkit/core')
  const schemaNodeArray = $.type("Array").generic(plugin.imports.FormKitSchemaNode)

  for (const [name, schema] of Object.entries(schemas)) {
    if (schema?.type !== "object" || !schema.properties) continue

    const nodes = objectToFormKitSchema(schema, schemas)
    const symbol = plugin.symbol(`${name}FormKitSchema`)
    // export const <Name>FormKitSchema: FormKitSchemaNode[] = [...]
    plugin.node(
      $.const(symbol)
        .export()
        .type(schemaNodeArray)
        .assign($.fromValue(nodes, { layout: "pretty" })),
    )
  }
}

export const formKitPlugin = definePluginConfig<FormKitPlugin["Types"]>({
  config: {},
  handler,
  // Emit `import type { FormKitSchemaNode } from '@formkit/core'` and expose it
  // as `plugin.imports.FormKitSchemaNode` for the annotation above.
  imports: (plugin: FormKitPlugin["Instance"]) => ({
    FormKitSchemaNode: plugin.symbolFactory.register("FormKitSchemaNode", {
      external: "@formkit/core",
      kind: "type",
    }),
  }),
  name: "formkit",
  symbolMeta: () => ({ artifact: "formkit" }),
} as FormKitPlugin["Config"])
