import { createInput } from '@formkit/vue'
import type { FormKitNode } from '@formkit/core'
import { VBtn } from 'vuetify/components'

/**
 * A minimal, dependency-free stand-in for FormKit Pro's `repeater` input.
 *
 * The generated schema emits `{ $formkit: 'repeater', name, children }`, where
 * `children` are the per-row fields. This input owns the row list itself and
 * renders the built-in add / remove controls.
 *
 * How it works:
 *  - `type: 'list'` makes the node's value an array of row objects.
 *  - The `for` loop iterates an *internal* tracking array (`$rows`) of stable
 *    keys — NOT the node's own value. Driving the loop from the value would be
 *    circular: removing an item by splicing the value can't destroy the child
 *    group node, so on the next commit the surviving group repopulates the
 *    array.
 *  - Each iteration renders a `group` (keyed by `$row.key`) whose fields come
 *    from the row template (`$slots.default` — the `children` passed to the
 *    node). The parent list auto-assigns each group its array index by render
 *    order, so fields bind to `items[i].product`, `items[i].quantity`, etc. The
 *    list's value is derived from the rendered groups.
 *  - Add / remove mutate `$rows`; the value follows as groups mount/unmount.
 */

// Internal row bookkeeping + add/remove handlers, exposed to the schema.
function repeaterFeature(node: FormKitNode) {
  // Defaults for the schema-referenced props (a props array can't set them).
  node.props.min ??= 0
  node.props.max ??= 0
  node.props.addLabel ??= '+ Add item'
  node.props.removeLabel ??= 'Remove'

  let nextKey = 0
  const makeRow = () => ({ key: nextKey++ })
  type Ctx = { rows: { key: number }[]; handlers: Record<string, unknown> }

  node.on('created', () => {
    const ctx = node.context as unknown as Ctx

    // Seed one row per existing value item (edit mode), but never below `min`.
    const valueLen = Array.isArray(node.value) ? node.value.length : 0
    const count = Math.max(valueLen, Number(node.props.min ?? 0))
    ctx.rows = Array.from({ length: count }, makeRow)

    ctx.handlers.repeaterAdd = () => {
      ctx.rows = [...ctx.rows, makeRow()]
    }
    // Curried so `$handlers.repeaterRemove($index)` yields a click handler
    // rather than removing during render.
    ctx.handlers.repeaterRemove = (index: number) => () => {
      ctx.rows = ctx.rows.filter((_, i) => i !== index)
    }
  })
}

export const repeater = createInput(
  {
    $el: 'div',
    attrs: { class: 'formkit-repeater' },
    children: [
      {
        $el: 'div',
        for: ['row', 'index', '$rows'],
        attrs: {
          key: '$row.key',
          // FormKit compiles an attr only when it *starts* with `$`, and its
          // compiler has no ternary — so gate the inter-row top margin with the
          // `&&`/`||` short-circuit (first row gets no margin).
          class:
            "$index > 0 && 'formkit-repeater-item mt-6' || 'formkit-repeater-item'",
        },
        children: [
          {
            $formkit: 'group',
            children: '$slots.default',
          },
          {
            $cmp: 'VBtn',
            props: {
              color: 'error',
              variant: 'tonal',
              disabled: '$rows.length <= $min',
              onClick: '$handlers.repeaterRemove($index)',
            },
            children: '$removeLabel',
          },
        ],
      },
      {
        $cmp: 'VBtn',
        props: {
          variant: 'tonal',
          class: 'mt-4',
          disabled: '$max > 0 && $rows.length >= $max',
          onClick: '$handlers.repeaterAdd',
        },
        children: '$addLabel',
      },
    ],
  },
  {
    type: 'list',
    library: { VBtn },
    props: ['min', 'max', 'addLabel', 'removeLabel'],
    features: [repeaterFeature],
  },
)
