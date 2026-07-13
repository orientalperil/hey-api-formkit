import { applyFieldOverrides } from "../apply-overrides.js"
import type { FormKitSchemaNode } from "@formkit/core"
import { describe, expect, it } from "vitest"

// A schema with a `product` field at BOTH the root and inside an `items`
// repeater, so path matching can be told apart from bare-name matching.
const schema: FormKitSchemaNode[] = [
  { $formkit: "text", name: "customer_name" },
  { $formkit: "number", name: "product", label: "Root product" },
  {
    $formkit: "repeater",
    name: "items",
    children: [
      { $formkit: "number", name: "product", label: "Line product" },
      { $formkit: "number", name: "quantity" },
    ],
  },
]

// Pull a node out of a result by its absolute path, e.g. "items.product".
const at = (nodes: FormKitSchemaNode[], path: string): Record<string, unknown> | undefined => {
  const [head, ...rest] = path.split(".")
  const found = nodes.find(
    (n) => !!n && typeof n === "object" && (n as Record<string, unknown>).name === head,
  ) as Record<string, unknown> | undefined
  if (!found) return undefined
  if (rest.length === 0) return found
  return at((found.children as FormKitSchemaNode[]) ?? [], rest.join("."))
}

describe("applyFieldOverrides", () => {
  it("targets the root field without touching the same-named nested one", () => {
    const result = applyFieldOverrides(schema, {
      product: { $formkit: "select", options: ["root"] },
    })

    expect(at(result, "product")).toMatchObject({ $formkit: "select", options: ["root"] })
    // The repeater's product is untouched.
    expect(at(result, "items.product")).toMatchObject({ $formkit: "number", label: "Line product" })
  })

  it("targets the nested field via its absolute path", () => {
    const result = applyFieldOverrides(schema, {
      "items.product": { $formkit: "select", options: ["nested"] },
    })

    expect(at(result, "items.product")).toMatchObject({ $formkit: "select", options: ["nested"] })
    // The root product is untouched.
    expect(at(result, "product")).toMatchObject({ $formkit: "number", label: "Root product" })
  })

  it("can override both independently in one call", () => {
    const result = applyFieldOverrides(schema, {
      product: { label: "Root!" },
      "items.product": { label: "Line!" },
    })

    expect(at(result, "product")).toMatchObject({ label: "Root!" })
    expect(at(result, "items.product")).toMatchObject({ label: "Line!" })
  })

  it("does not match a nested field by bare name", () => {
    const nested: FormKitSchemaNode[] = [
      { $formkit: "repeater", name: "items", children: [{ $formkit: "number", name: "product" }] },
    ]

    const result = applyFieldOverrides(nested, {
      product: { $formkit: "select" },
    })

    // Bare `product` is an absolute root path; the only `product` is at items.product.
    expect(at(result, "items.product")).toMatchObject({ $formkit: "number" })
  })

  it("shallow-merges the override onto the node, keeping other keys", () => {
    const result = applyFieldOverrides(schema, {
      "items.quantity": { validation: "required" },
    })

    expect(at(result, "items.quantity")).toMatchObject({
      $formkit: "number",
      name: "quantity",
      validation: "required",
    })
  })

  it("does not mutate the input schema", () => {
    const before = structuredClone(schema)
    applyFieldOverrides(schema, { product: { $formkit: "select" } })
    expect(schema).toEqual(before)
  })
})
