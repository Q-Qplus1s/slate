import React, { useRef } from 'react'
import { Editor, Text, Path, Element, Node } from '@shware/slate'

import { ReactEditor, useSlateStatic } from '..'
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect'

/**
 * Leaf content strings.
 */

const String = (props: {
  isLast: boolean
  leaf: Text
  parent: Element
  text: Text
}) => {
  const { isLast, leaf, parent, text } = props
  const editor = useSlateStatic()
  const path = ReactEditor.findPath(editor, text)
  const parentPath = Path.parent(path)

  // COMPAT: Render text inside void nodes with a zero-width space.
  // So the node can contain selection but the text is not visible.
  if (editor.isVoid(parent)) {
    return <ZeroWidthString length={Node.string(parent).length} />
  }

  // COMPAT: If this is the last text node in an empty block, render a zero-
  // width space that will convert into a line break when copying and pasting
  // to support expected plain text.
  if (
    leaf.text === '' &&
    parent.children[parent.children.length - 1] === text &&
    !editor.isInline(parent) &&
    Editor.string(editor, parentPath) === ''
  ) {
    return <ZeroWidthString isLineBreak />
  }

  // COMPAT: If the text is empty, it's because it's on the edge of an inline
  // node, so we render a zero-width space so that the selection can be
  // inserted next to it still.
  if (leaf.text === '') {
    return <ZeroWidthString />
  }

  // COMPAT: Browsers will collapse trailing new lines at the end of blocks,
  // so we need to add an extra trailing new lines to prevent that.
  if (isLast && leaf.text.slice(-1) === '\n') {
    return <TextString isTrailing text={leaf.text} />
  }

  return <TextString text={leaf.text} />
}

/**
 * Leaf strings with text in them.
 */

const TextString = (props: { text: string; isTrailing?: boolean }) => {
  const { text, isTrailing = false } = props
  const ref = useRef<HTMLSpanElement>(null)
  useIsomorphicLayoutEffect(() => {
    // if (ref.current && ref.current.innerText !== text) {
    //   ref.current.innerText = text
    // }
    if (ref.current) {
      let htmlText = ref.current.innerText
      if (isTrailing) {
        htmlText = htmlText.slice(0, -1)
      }
      if (htmlText !== text) {
        ref.current.innerText = text + (isTrailing ? '\n' : '')
      }
    }
  })
  return (
    <span data-slate-string ref={ref}>
      {text}
      {isTrailing ? '\n' : null}
    </span>
  )
}

/**
 * Leaf strings without text, render as zero-width strings.
 */

const ZeroWidthString = (props: { length?: number; isLineBreak?: boolean }) => {
  const { length = 0, isLineBreak = false } = props
  return (
    <span
      data-slate-zero-width={isLineBreak ? 'n' : 'z'}
      data-slate-length={length}
    >
      {'\uFEFF'}
      {isLineBreak ? <br /> : null}
    </span>
  )
}

export default String
