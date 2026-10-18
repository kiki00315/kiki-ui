import { useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import './Tabs.css'

export type TabItem = { id: string; label: string; content: ReactNode; disabled?: boolean }

export type TabsProps = {
  tabs: TabItem[]
  /** 最初に開いておくタブの id。省略すると、最初の選べるタブ */
  defaultValue?: string
  /** タブ全体の名前（「作品の種類」など）。スクリーンリーダーが読み上げる */
  'aria-label': string
  onChange?: (id: string) => void
}

// WAI-ARIA の「タブ」の作法にそろえる
//   ・← → で隣のタブへ、Home / End で最初・最後へ（選ぶと同時に開く）
//   ・Tab キーで入ると、開いているタブにだけ止まる（ほかのタブは tabIndex=-1）
export function Tabs({ tabs, defaultValue, onChange, ...rest }: TabsProps) {
  const base = useId()
  const firstEnabled = tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id
  const [active, setActive] = useState(defaultValue ?? firstEnabled)
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const select = (id: string) => {
    setActive(id)
    onChange?.(id)
    refs.current[id]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = tabs.filter((t) => !t.disabled)
    const i = enabled.findIndex((t) => t.id === active)
    let next: TabItem | undefined
    if (e.key === 'ArrowRight') next = enabled[(i + 1) % enabled.length]
    else if (e.key === 'ArrowLeft') next = enabled[(i - 1 + enabled.length) % enabled.length]
    else if (e.key === 'Home') next = enabled[0]
    else if (e.key === 'End') next = enabled[enabled.length - 1]
    if (next) { e.preventDefault(); select(next.id) }
  }

  const current = tabs.find((t) => t.id === active)

  return (
    <div className="kk-tabs">
      <div className="kk-tabs__list" role="tablist" aria-label={rest['aria-label']} onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[t.id] = el }}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={t.id === active ? 0 : -1}
            disabled={t.disabled}
            className="kk-tabs__tab"
            onClick={() => select(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current && (
        <div
          role="tabpanel"
          id={`${base}-panel-${current.id}`}
          aria-labelledby={`${base}-tab-${current.id}`}
          className="kk-tabs__panel"
          tabIndex={0}
        >
          {current.content}
        </div>
      )}
    </div>
  )
}
