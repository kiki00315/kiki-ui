import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import './Tree.css'

export type TreeNode = {
  id: string
  label: string
  /** 子の項目。あると「フォルダ」のように、開け閉めできる */
  children?: TreeNode[]
}

export type TreeProps = {
  nodes: TreeNode[]
  /** ツリー全体の名前（「ファイル」など）。スクリーンリーダーが読み上げる */
  'aria-label': string
  /** 最初に開いておく項目の id */
  defaultExpanded?: string[]
  /** 最初に選んでおく項目の id */
  defaultSelected?: string
  onSelect?: (id: string) => void
}

// いま見えている項目（開いている枝の中だけ）を、上から順に並べたもの。↑↓ で動くときに使う
type Flat = { node: TreeNode; parentId: string | null }

function flatten(nodes: TreeNode[], expanded: Set<string>, parentId: string | null = null): Flat[] {
  return nodes.flatMap((node) => [
    { node, parentId },
    ...(node.children && expanded.has(node.id) ? flatten(node.children, expanded, node.id) : []),
  ])
}

// WAI-ARIA の「ツリービュー」の作法にそろえる
//   ↑↓：見えている項目の移動 ／ →：開く（開いていれば、最初の子へ）／ ←：閉じる（閉じていれば、親へ）
//   Home / End：最初・最後へ ／ Enter・Space：選ぶ（フォルダは、開け閉めも）
//   Tab で入ると、フォーカスの置き場所（tabIndex=0）は 1 か所だけ
export function Tree({ nodes, defaultExpanded = [], defaultSelected, onSelect, ...rest }: TreeProps) {
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded))
  const [selected, setSelected] = useState<string | null>(defaultSelected ?? null)
  const [focusId, setFocusId] = useState(defaultSelected ?? nodes[0]?.id)
  const refs = useRef<Record<string, HTMLLIElement | null>>({})
  const base = useId()

  const visible = flatten(nodes, expanded)

  const moveTo = (id: string | undefined) => {
    if (!id) return
    setFocusId(id)
    refs.current[id]?.focus()
  }

  const toggle = (id: string) =>
    setExpanded((set) => {
      const next = new Set(set)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const choose = (node: TreeNode) => {
    setSelected(node.id)
    setFocusId(node.id)
    onSelect?.(node.id)
    if (node.children) toggle(node.id)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]')
    const id = item?.dataset.id
    const index = visible.findIndex((v) => v.node.id === id)
    if (index < 0) return
    const { node, parentId } = visible[index]
    const isOpen = expanded.has(node.id)
    let handled = true
    if (e.key === 'ArrowDown') moveTo(visible[index + 1]?.node.id)
    else if (e.key === 'ArrowUp') moveTo(visible[index - 1]?.node.id)
    else if (e.key === 'Home') moveTo(visible[0].node.id)
    else if (e.key === 'End') moveTo(visible[visible.length - 1].node.id)
    else if (e.key === 'ArrowRight') {
      if (node.children) { if (!isOpen) toggle(node.id); else moveTo(node.children[0]?.id) }
    } else if (e.key === 'ArrowLeft') {
      if (node.children && isOpen) toggle(node.id)
      else if (parentId) moveTo(parentId)
    } else if (e.key === 'Enter' || e.key === ' ') choose(node)
    else handled = false
    if (handled) e.preventDefault()
  }

  const renderNodes = (list: TreeNode[], level: number) =>
    list.map((node, i) => {
      const hasChildren = !!node.children?.length
      const isOpen = hasChildren && expanded.has(node.id)
      return (
        <li
          key={node.id}
          ref={(el) => { refs.current[node.id] = el }}
          role="treeitem"
          data-id={node.id}
          // 名前は「この行の文字」だけにする（付けないと、子の項目の文字まで全部つながって、名前になってしまう）
          aria-labelledby={`${base}-${node.id}`}
          aria-level={level}
          aria-setsize={list.length}
          aria-posinset={i + 1}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={selected === node.id}
          tabIndex={focusId === node.id ? 0 : -1}
          className="kk-tree__item"
          onFocus={(e) => { if (e.target === e.currentTarget) setFocusId(node.id) }}
        >
          {/* 押せる範囲は、この 1 行（li 全体にすると、子の項目を押したときにも、親が反応してしまう） */}
          <div className="kk-tree__row" style={{ paddingLeft: `calc(var(--space-2) + ${(level - 1) * 20}px)` }} onClick={() => choose(node)}>
            <span className={`kk-tree__caret ${hasChildren ? (isOpen ? 'kk-tree__caret--open' : 'kk-tree__caret--closed') : ''}`} aria-hidden="true" />
            <span id={`${base}-${node.id}`}>{node.label}</span>
          </div>
          {hasChildren && isOpen && <ul role="group" className="kk-tree__group">{renderNodes(node.children!, level + 1)}</ul>}
        </li>
      )
    })

  return (
    <ul role="tree" aria-label={rest['aria-label']} className="kk-tree" onKeyDown={onKeyDown}>
      {renderNodes(nodes, 1)}
    </ul>
  )
}
