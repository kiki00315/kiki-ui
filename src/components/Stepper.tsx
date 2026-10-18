import './Stepper.css'

export type StepperStep = {
  label: string
  /** 補足の説明（任意） */
  description?: string
}

export type StepperProps = {
  steps: StepperStep[]
  /** いま何番目か（0 から数える）。これより前は「完了」、これは「現在」、あとは「まだ」 */
  current: number
  /** 手順全体の名前（「ご注文の流れ」など）。スクリーンリーダーが読み上げる */
  'aria-label': string
}

type State = 'complete' | 'current' | 'upcoming'

// 色や形だけで状態を伝えないよう、読み上げ用の文字（「完了」など）も入れる
const STATE_LABEL: Record<State, string> = { complete: '完了', current: '現在のステップ', upcoming: 'まだのステップ' }

// 手順の「いまここ」を見せる、動かない表示（押して移動する部品ではない）。
// 順番つきのリスト（<ol>）にして、いまのステップには aria-current="step" を付ける
export function Stepper({ steps, current, ...rest }: StepperProps) {
  return (
    <ol className="kk-stepper" aria-label={rest['aria-label']}>
      {steps.map((step, i) => {
        const state: State = i < current ? 'complete' : i === current ? 'current' : 'upcoming'
        return (
          <li key={`${step.label}-${i}`} className={`kk-stepper__step kk-stepper__step--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="kk-stepper__marker" aria-hidden="true">{state === 'complete' ? '' : i + 1}</span>
            <span className="kk-stepper__text">
              <span className="kk-stepper__label">{step.label}</span>
              <span className="kk-visually-hidden">（{STATE_LABEL[state]}）</span>
              {step.description && <span className="kk-stepper__desc">{step.description}</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
