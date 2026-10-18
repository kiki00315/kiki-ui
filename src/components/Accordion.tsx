import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import './Accordion.css'

export type AccordionItem = { id: string; title: string; content: ReactNode }

export type AccordionProps = {
  items: AccordionItem[]
  /** 最初に開いておく項目の id */
  defaultOpen?: string[]
  /** true にすると、複数の項目を同時に開ける。初期値は、1 つだけ開く */
  multiple?: boolean
  /** 見出しのレベル（ページの見出しの階層に合わせる）。初期値は h3 */
  headingLevel?: 2 | 3 | 4
}

// 「見出し」の中に「ボタン」を入れる、WAI-ARIA の作法にそろえる。
// Enter / Space で開閉でき、aria-expanded で開閉の状態が読み上げられる
export function Accordion({ items, defaultOpen = [], multiple = false, headingLevel = 3 }: AccordionProps) {
  const base = useId()
  const [open, setOpen] = useState<string[]>(defaultOpen)
  const Heading = `h${headingLevel}` as const

  const toggle = (id: string) =>
    setOpen((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id)
      return multiple ? [...list, id] : [id]
    })

  return (
    <div className="kk-accordion">
      {items.map((item) => {
        const isOpen = open.includes(item.id)
        return (
          <div key={item.id} className="kk-accordion__item">
            <Heading className="kk-accordion__heading">
              <button
                type="button"
                id={`${base}-${item.id}-button`}
                className="kk-accordion__button"
                aria-expanded={isOpen}
                aria-controls={`${base}-${item.id}-panel`}
                onClick={() => toggle(item.id)}
              >
                <span>{item.title}</span>
                <span className="kk-accordion__icon" aria-hidden="true" />
              </button>
            </Heading>
            <div
              id={`${base}-${item.id}-panel`}
              role="region"
              aria-labelledby={`${base}-${item.id}-button`}
              className="kk-accordion__panel"
              hidden={!isOpen}
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
