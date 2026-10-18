import { TextField } from './TextField'
import type { TextFieldProps } from './TextField'

export type DatePickerProps = Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'> & {
  /** 選ばれている日付。「2026-10-20」の形（年-月-日）の文字。空なら、まだ選んでいない */
  value?: string
  defaultValue?: string
  /** 日付が変わったとき、「2026-10-20」の形の文字（空のときは ''）で知らせる */
  onChange?: (value: string) => void
  /** 選べる、いちばん早い日（「2026-10-01」の形） */
  min?: string
  /** 選べる、いちばん遅い日 */
  max?: string
}

// ブラウザ標準の日付入力（<input type="date">）を土台にした。
// 標準のものは、キーボード操作・スマホの日付選択・読み上げ・言語ごとの表示が、最初から正しく動く。
// 自分で作るカレンダーは、それらを全部作り直すことになるので、ここでは作らない
export function DatePicker({ value, defaultValue, onChange, min, max, error, ...rest }: DatePickerProps) {
  // 範囲の外の日付が入っているとき、エラーの文章を自動で出す（「YYYY-MM-DD」の形なら、文字の大小がそのまま日付の前後になる）
  const current = value ?? defaultValue
  let rangeError: string | undefined
  if (current && min && current < min) rangeError = `${min.replaceAll('-', '/')} 以降の日付を選んでください`
  else if (current && max && current > max) rangeError = `${max.replaceAll('-', '/')} 以前の日付を選んでください`

  return (
    <TextField
      type="date"
      {...rest}
      min={min}
      max={max}
      error={error ?? rangeError}
      {...(value !== undefined ? { value } : { defaultValue })}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}
