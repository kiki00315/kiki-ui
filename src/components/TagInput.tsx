import { useId, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { isComposingKey } from './ime'
import './TextField.css'
import './TagInput.css'

export type TagInputProps = {
  /** 入力欄の名前（「タグ」など）。画面に必ず出す */
  label: string
  /** いまのタグ（親が持つとき） */
  value?: string[]
  /** 最初のタグ（親が持たないとき） */
  defaultValue?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  hint?: string
  /** エラーの文章。あると赤い枠になり、入力欄に結びつく */
  error?: string
  /** 入れられるタグの数の上限 */
  maxTags?: number
  disabled?: boolean
}

// 区切りに使う文字。Enter・半角のカンマ・全角の読点（、）で、タグが 1 つ決まる
const SEPARATORS = [',', '、']

export function TagInput({ label, value, defaultValue = [], onChange, placeholder, hint, error, maxTags, disabled }: TagInputProps) {
  const base = useId()
  const [inner, setInner] = useState<string[]>(defaultValue)
  const tags = value ?? inner
  const [text, setText] = useState('')
  // 追加・削除を読み上げで知らせる文（画面には出さない）
  const [announce, setAnnounce] = useState('')

  const update = (next: string[]) => {
    setInner(next)
    onChange?.(next)
  }

  // 何個かまとめて追加する（貼り付けで、一度に何個も入ることがあるので、「いまのタグ」を 1 つのコピーに積み上げていく。
  // 1 個ずつ追加を繰り返すと、後ろの追加が、前の追加を上書きしてしまう）
  const addAll = (raws: string[]) => {
    const next = [...tags]
    let message = ''
    for (const raw of raws) {
      const tag = raw.trim()
      if (!tag) continue
      if (next.includes(tag)) message = `「${tag}」は、もう入っています`
      else if (maxTags !== undefined && next.length >= maxTags) message = `タグは ${maxTags} 個までです`
      else { next.push(tag); message = `「${tag}」を追加しました` }
    }
    if (next.length !== tags.length) update(next)
    if (message) setAnnounce(message)
  }
  const add = (raw: string) => {
    addAll([raw])
    // 入れられなかったとき（上限）以外は、入力欄を空にする
    if (maxTags === undefined || tags.length < maxTags || tags.includes(raw.trim())) setText('')
  }

  const remove = (tag: string) => {
    update(tags.filter((t) => t !== tag))
    setAnnounce(`「${tag}」を削除しました`)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 日本語の入力で、変換を確定する Enter では、タグを追加しない（Chrome は isComposing、Safari は keyCode 229 で見分ける）
    if (isComposingKey(e)) return
    if (e.key === 'Enter' || SEPARATORS.includes(e.key)) {
      // Enter は、フォームの送信を止めて、タグにする。文字が空なら、何もしない（送信もそのまま）
      if (text.trim()) { e.preventDefault(); add(text) }
      else if (SEPARATORS.includes(e.key)) e.preventDefault()
    } else if (e.key === 'Backspace' && text === '' && tags.length > 0) {
      remove(tags[tags.length - 1])
    }
  }

  const describedBy = [hint && `${base}-hint`, error && `${base}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`kk-field kk-tags ${error ? 'kk-field--error' : ''}`.trim()}>
      <label className="kk-field__label" htmlFor={`${base}-input`}>{label}</label>
      <div className="kk-tags__box kk-field__input">
        {tags.length > 0 && (
          <ul className="kk-tags__list" aria-label={`${label}（入力済み）`}>
            {tags.map((tag) => (
              <li key={tag} className="kk-tags__tag">
                <span>{tag}</span>
                <button type="button" className="kk-tags__remove" onClick={() => remove(tag)} disabled={disabled} aria-label={`${tag}を削除`}>×</button>
              </li>
            ))}
          </ul>
        )}
        <input
          id={`${base}-input`}
          className="kk-tags__input"
          value={text}
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => {
            // 貼り付けなどで、区切り文字が入ってきたときは、その場でタグに分ける
            const parts = e.target.value.split(new RegExp(`[${SEPARATORS.join('')}]`))
            if (parts.length > 1 && !(e.nativeEvent as InputEvent).isComposing) {
              addAll(parts.slice(0, -1))
              setText(parts[parts.length - 1])
            } else setText(e.target.value)
          }}
          onKeyDown={onKeyDown}
          // 入力欄を離れるとき、打ちかけの文字もタグにする（消えてしまわないように）
          onBlur={() => add(text)}
        />
      </div>
      <p className="kk-visually-hidden" role="status">{announce}</p>
      {hint && <p className="kk-field__hint" id={`${base}-hint`}>{hint}</p>}
      {error && <p className="kk-field__error" id={`${base}-error`}>{error}</p>}
    </div>
  )
}
