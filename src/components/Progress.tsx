import { useId } from 'react'
import type { ProgressHTMLAttributes } from 'react'
import './Progress.css'

export type ProgressProps = Omit<ProgressHTMLAttributes<HTMLProgressElement>, 'value' | 'max'> & {
  /** 何の進み具合か（「アップロード」など）。画面に必ず出す */
  label: string
  /** いまの値。省略すると「どれくらいかわからない」状態（ぐるぐる動く）になる */
  value?: number
  /** 最大の値。初期値は 100 */
  max?: number
  /** 右に「40%」のように数字も出す（値があるときだけ） */
  showValue?: boolean
}

// 標準の <progress> を使う。role="progressbar" と、現在の値の読み上げが、最初から正しく付く
export function Progress({ label, value, max = 100, showValue = false, id, className = '', ...rest }: ProgressProps) {
  const autoId = useId()
  const progressId = id ?? autoId
  const percent = value === undefined ? null : Math.round((value / max) * 100)

  return (
    <div className={`kk-progress ${className}`.trim()}>
      <div className="kk-progress__head">
        <label htmlFor={progressId} className="kk-progress__label">{label}</label>
        {showValue && percent !== null && <span className="kk-progress__value" aria-hidden="true">{percent}%</span>}
      </div>
      <progress id={progressId} className="kk-progress__bar" value={value} max={max} {...rest} />
    </div>
  )
}
