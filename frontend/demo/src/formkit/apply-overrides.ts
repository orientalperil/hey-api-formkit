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
 */
export function applyFieldOverrides(
  schema: readonly FormKitSchemaNode[],
  overrides: Record<string, FieldOverride>,
): FormKitSchemaNode[] {
  const clone = structuredClone(schema) as FormKitSchemaNode[]

  const walk = (nodes: FormKitSchemaNode[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue
      const record = node as Record<string, unknown>
      if (typeof record.name === 'string' && overrides[record.name]) {
        Object.assign(record, overrides[record.name])
      }
      if (Array.isArray(record.children)) walk(record.children as FormKitSchemaNode[])
    }
  }

  walk(clone)
  return clone
}
