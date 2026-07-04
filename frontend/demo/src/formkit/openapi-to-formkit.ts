import type { FormKitSchemaFormKit, FormKitSchemaNode } from '@formkit/core'

/**
 * Convert the JSON Schemas emitted by `@hey-api/schemas` (in
 * `src/client/schemas.gen.ts`) into a FormKit schema.
 *
 * @see https://formkit.com/essentials/schema
 *
 * The generator maps JSON Schema types/constraints to FormKit inputs and
 * validation rules. Relations (foreign-key integers) can't be resolved to
 * options generically, so those are supplied per-field via `overrides`.
 */

/** A single property of a JSON Schema `object`, as produced by hey-api. */
export interface JsonSchemaProperty {
  type?: string
  format?: string
  enum?: readonly string[]
  nullable?: boolean
  readOnly?: boolean
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
  $ref?: string
}

/** A JSON Schema `object` (the top-level model schema). */
export interface JsonSchemaObject {
  type?: string
  properties?: Readonly<Record<string, JsonSchemaProperty>>
  required?: readonly string[]
}

/** Merge into the generated node, or `null` to omit the field entirely. */
export type FieldOverride = Partial<FormKitSchemaFormKit> | null

export interface ToFormKitOptions {
  /** Per-property overrides, keyed by property name. */
  overrides?: Record<string, FieldOverride>
  /** Resolve a `$ref` (e.g. an enum) to its schema. */
  resolveRef?: (ref: string) => JsonSchemaProperty | undefined
  /** Produce a human label from a property name. */
  labelFor?: (name: string) => string
}

/** "customer_name" -> "Customer name" */
function humanize(name: string): string {
  const spaced = name.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Map a single JSON Schema property to a FormKit `$formkit` node. */
function propertyToNode(
  name: string,
  raw: JsonSchemaProperty,
  isRequired: boolean,
  opts: ToFormKitOptions,
): FormKitSchemaFormKit {
  // Inline any `$ref` (used by enums such as StatusEnum).
  const prop: JsonSchemaProperty = raw.$ref
    ? { ...raw, ...(opts.resolveRef?.(raw.$ref) ?? {}) }
    : raw

  const label = (opts.labelFor ?? humanize)(name)
  const validation: string[] = []
  if (isRequired) validation.push('required')

  const node: FormKitSchemaFormKit = { $formkit: 'text', name, label }

  if (prop.enum) {
    node.$formkit = 'select'
    node.options = prop.enum.map((value) => ({ value, label: humanize(value) }))
  } else if (prop.type === 'boolean') {
    node.$formkit = 'checkbox'
  } else if (prop.type === 'integer' || prop.type === 'number') {
    node.$formkit = 'number'
    if (typeof prop.minimum === 'number') validation.push(`min:${prop.minimum}`)
    if (typeof prop.maximum === 'number') validation.push(`max:${prop.maximum}`)
  } else {
    // string and everything else
    switch (prop.format) {
      case 'email':
        node.$formkit = 'email'
        validation.push('email')
        break
      case 'decimal':
        // DRF serializes decimals as strings; validate as a number.
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

/**
 * Convert a JSON Schema object into an array of FormKit schema nodes.
 * Read-only properties are skipped so the result maps to a writable request body.
 */
export function objectToFormKitSchema(
  schema: JsonSchemaObject,
  opts: ToFormKitOptions = {},
): FormKitSchemaNode[] {
  const required = new Set(schema.required ?? [])
  const nodes: FormKitSchemaNode[] = []

  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    if (prop.readOnly) continue

    const override = opts.overrides?.[name]
    if (override === null) continue // explicitly omitted

    const base = propertyToNode(name, prop, required.has(name), opts)
    nodes.push(override ? { ...base, ...override } : base)
  }

  return nodes
}

/**
 * Wrap FormKit field nodes in a repeatable `list` of `group`s, driven by a
 * reactive array reference (`listRef`, e.g. `"$rows"`). Used for `array`
 * properties like an order's line items, which the plain object converter
 * leaves to the caller because add/remove is a runtime concern.
 */
export function repeatableList(config: {
  name: string
  listRef: string
  fields: FormKitSchemaNode[]
  keyRef?: string
}): FormKitSchemaFormKit {
  return {
    $formkit: 'list',
    name: config.name,
    children: [
      {
        $formkit: 'group',
        for: ['row', 'index', config.listRef],
        ...(config.keyRef ? { key: config.keyRef } : {}),
        children: config.fields,
      } as FormKitSchemaFormKit,
    ],
  }
}
