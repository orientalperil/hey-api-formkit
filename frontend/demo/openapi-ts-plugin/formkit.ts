/**
 * A custom `@hey-api/openapi-ts` plugin that emits FormKit schema arrays.
 *
 * For every object schema in the spec it writes an exported
 * `<Name>FormKitSchema` constant to `src/client/formkit.gen.ts`. Because this
 * runs at generation time with the whole spec graph in hand, `$ref`s (e.g. the
 * `status` enum) are resolved and inlined — no runtime ref resolution needed.
 *
 * @see https://heyapi.dev/openapi-ts/plugins  (custom plugins)
 * @see https://formkit.com/essentials/schema
 */
import { $, definePluginConfig } from '@hey-api/openapi-ts'
import type { PluginInstance } from '@hey-api/openapi-ts'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

interface FormKitPluginConfig {
  name: string
  /**
   * Map a property name to a FormKit `options` reference so foreign-key
   * integers render as `<select>`s fed by runtime data, e.g.
   * `{ supplier: '$supplierOptions' }`. The referenced data is supplied to
   * `<FormKitSchema :data>` at runtime.
   */
  relations: Record<string, string>
  /** Append a per-row "Remove" button inside repeatable array groups. */
  arrayRemoveButton: boolean
}

// ---------------------------------------------------------------------------
// JSON Schema -> FormKit schema conversion (runs at build time)
// ---------------------------------------------------------------------------

// Loosely-typed view of the raw OpenAPI schema objects in the spec.
type Schema = Record<string, any>
type FormKitNode = Record<string, unknown>

/** "customer_name" -> "Customer name" */
function humanize(name: string): string {
  const spaced = name.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Resolve a local `$ref` (e.g. `#/components/schemas/StatusEnum`). */
function deref(schema: Schema, schemas: Record<string, Schema>): Schema {
  if (typeof schema?.$ref === 'string') {
    const name = schema.$ref.split('/').pop() as string
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
  config: FormKitPluginConfig,
): FormKitNode {
  const prop = deref(rawProp, schemas)
  const node: FormKitNode = { $formkit: 'text', name, label: humanize(name) }
  const validation: string[] = []
  if (isRequired) validation.push('required')

  const relationOptions = config.relations[name]

  if (relationOptions) {
    // Foreign-key relation -> select fed by runtime options.
    node.$formkit = 'select'
    node.options = relationOptions
    if (isRequired) node.placeholder = `Select a ${humanize(name).toLowerCase()}…`
  } else if (Array.isArray(prop.enum)) {
    node.$formkit = 'select'
    node.options = prop.enum.map((value: string) => ({ value, label: humanize(String(value)) }))
  } else if (prop.type === 'boolean') {
    node.$formkit = 'checkbox'
  } else if (prop.type === 'integer' || prop.type === 'number') {
    node.$formkit = 'number'
    if (typeof prop.minimum === 'number') validation.push(`min:${prop.minimum}`)
    if (typeof prop.maximum === 'number') validation.push(`max:${prop.maximum}`)
  } else {
    switch (prop.format) {
      case 'email':
        node.$formkit = 'email'
        validation.push('email')
        break
      case 'decimal': // DRF serializes decimals as strings; validate as a number.
        node.$formkit = 'text'
        validation.push('number')
        break
      case 'date-time':
        node.$formkit = 'datetime-local'
        break
      default:
        node.$formkit = 'text'
    }
    if (typeof prop.maxLength === 'number') validation.push(`length:0,${prop.maxLength}`)
  }

  if (validation.length) node.validation = validation.join('|')
  return node
}

/** Convert one object schema into an array of FormKit nodes (skips read-only). */
function objectToFormKitSchema(
  schema: Schema,
  schemas: Record<string, Schema>,
  config: FormKitPluginConfig,
): FormKitNode[] {
  const required: string[] = Array.isArray(schema.required) ? schema.required : []
  const nodes: FormKitNode[] = []

  for (const [name, rawProp] of Object.entries(schema.properties ?? {})) {
    const prop = deref(rawProp as Schema, schemas)
    if (prop.readOnly) continue

    if (prop.type === 'array' && prop.items) {
      // Repeatable list of object items, driven by a reactive `$<name>_rows`
      // array supplied at runtime. Add/remove is a runtime concern.
      const itemSchema = deref(prop.items, schemas)
      const itemFields = objectToFormKitSchema(itemSchema, schemas, config)
      if (config.arrayRemoveButton) {
        itemFields.push({
          $el: 'button',
          attrs: { type: 'button', class: 'formkit-remove', onClick: `$${name}_remove($index)` },
          children: 'Remove',
        })
      }
      nodes.push({
        $formkit: 'list',
        name,
        children: [
          {
            $formkit: 'group',
            for: ['row', 'index', `$${name}_rows`],
            key: '$row.key',
            children: itemFields,
          },
        ],
      })
      continue
    }

    nodes.push(propertyToNode(name, rawProp as Schema, required.includes(name), schemas, config))
  }

  return nodes
}

// ---------------------------------------------------------------------------
// Plugin handler
// ---------------------------------------------------------------------------

const handler = ({ plugin }: { plugin: PluginInstance<any> }) => {
  const spec = plugin.context.spec as { components?: { schemas?: Record<string, Schema> } }
  const schemas = spec.components?.schemas
  if (!schemas) return

  const config = plugin.config as FormKitPluginConfig

  for (const [name, schema] of Object.entries(schemas)) {
    if (schema?.type !== 'object' || !schema.properties) continue

    const nodes = objectToFormKitSchema(schema, schemas, config)
    const symbol = plugin.symbol(`${name}FormKitSchema`)
    plugin.node($.const(symbol).export().assign($.fromValue(nodes, { layout: 'pretty' })))
  }
}

export const formKitPlugin = definePluginConfig({
  config: {
    arrayRemoveButton: true,
    relations: {},
  },
  handler,
  name: 'formkit',
  symbolMeta: () => ({ artifact: 'formkit' }),
} as any)
