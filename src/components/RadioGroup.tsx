import { useId } from 'react'
import type { ChangeEvent } from 'react'
import './Choice.css'
import './RadioGroup.css'

export type RadioOption = { value: string; label: string; disabled?: boolean }

export type RadioGroupProps = {
  /** グループの名前（「作品の種類」など）。スクリーンリーダーが、選択肢の前に読み上げる */
  legend: string
  options: RadioOption[]
  /** 選ばれている値（親が持つとき） */
  value?: string
  /** 最初に選んでおく値（親が持たないとき） */
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  /** エラーの文章。あると赤くなり、グループに結びつく */
  error?: string
}

// <fieldset> と <legend> でまとめた、ラジオボタンの集まり。↑↓←→ キーでの移動は、ブラウザ標準のまま
export function RadioGroup({ legend, options, value, defaultValue, onChange, disabled, error }: RadioGroupProps) {
  const name = useId()
  const errorId = `${name}-error`
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)

  return (
    <fieldset className="kk-radios" role="radiogroup" disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}>
      <legend className="kk-radios__legend">{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className={`kk-choice ${disabled || o.disabled ? 'kk-choice--disabled' : ''}`}>
          <input
            type="radio"
            name={name}
            value={o.value}
            className="kk-choice__input"
            disabled={o.disabled}
            // value を渡したときは「親が決める」、渡さないときは「自分で覚える」
            {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })}
            onChange={handle}
          />
          <span>{o.label}</span>
        </label>
      ))}
      {error && <p className="kk-radios__error" id={errorId}>{error}</p>}
    </fieldset>
  )
}
