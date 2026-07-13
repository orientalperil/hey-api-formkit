import type { FormKitSchemaNode } from "@formkit/core"

/**
 * A shallow patch merged onto a generated field node, keyed by the field's
 * `name`. Use it to turn generated inputs into something app-specific — e.g. a
 * foreign-key `number` into a `select` bound to runtime options.
 */
export type FieldOverride = Record<string, unknown>

/**
 * Apply per-field overrides to a generated FormKit schema, matching each override against a node's
 * **absolute path** — the dot-joined chain of `name`s from the schema root down
 * to the node, e.g. `customer_name` for a top-level field or `items.product`
 * for a `product` nested inside an `items` repeater.
 *
 * Because paths are absolute, sibling fields that happen to share a `name` at
 * different depths are addressed independently: `product` targets only a
 * root-level `product`, while `items.product` targets only the one inside the
 * `items` repeater. A key never matches by bare name alone.
 *
 * This keeps the hey-api plugin app-agnostic: knowledge of *this* app's models
 * (which fields are relations, what options feed them) lives in the view that
 * owns the form, not in codegen config.
 *
 * The input is cloned, so the module-level generated constant is never mutated.
 */
export function applyFieldOverrides(
  schema: readonly FormKitSchemaNode[],
  overrides: Record<string, FieldOverride>,
): FormKitSchemaNode[] {
  const clone = structuredClone(schema) as FormKitSchemaNode[]

  const walk = (nodes: FormKitSchemaNode[], path: readonly string[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue
      const record = node as Record<string, unknown>
      const named = typeof record.name === "string"
      const nodePath = named ? [...path, record.name as string] : path
      if (named) {
        const override = overrides[nodePath.join(".")]
        if (override) Object.assign(record, override)
      }
      if (Array.isArray(record.children)) walk(record.children as FormKitSchemaNode[], nodePath)
    }
  }

  walk(clone, [])
  return clone
}
