import type { FormKitSchemaNode } from '@formkit/core'

/**
 * A shallow patch merged onto a generated field node, keyed by the field's
 * `name`. Use it to turn generated inputs into something app-specific — e.g. a
 * foreign-key `number` into a `select` bound to runtime options.
 */
export type FieldOverride = Record<string, unknown>

/**
 * Apply per-field overrides to a generated FormKit schema (see
 * `src/client/formkit.gen.ts`), matching on each node's `name` and recursing
 * into nested `children` (so fields inside repeatable groups are reached too).
 *
 * This keeps the hey-api plugin app-agnostic: knowledge of *this* app's models
 * (which fields are relations, what options feed them) lives in the view that
 * owns the form, not in codegen config.
 *
 * The input is cloned, so the module-level generated constant is never mutated.
 * The return type is `FormKitSchemaNode[]`, so callers don't need a cast.
 */
export function applyFieldOverrides(
  schema: readonly unknown[],
  overrides: Record<string, FieldOverride>,
): FormKitSchemaNode[] {
  const clone = structuredClone(schema) as Array<Record<string, unknown>>

  const walk = (nodes: Array<Record<string, unknown>>) => {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue
      if (typeof node.name === 'string' && overrides[node.name]) {
        Object.assign(node, overrides[node.name])
      }
      if (Array.isArray(node.children)) walk(node.children)
    }
  }

  walk(clone)
  return clone as unknown as FormKitSchemaNode[]
}
