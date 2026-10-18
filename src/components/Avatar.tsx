import { useState } from 'react'
import { getInitials } from './avatarInitials'
import './Avatar.css'

export type AvatarSize = 'sm' | 'md' | 'lg'

export type AvatarProps = {
  /** 名前。画像がないとき・読み込めないときは、ここから頭文字を出す。読み上げにも使う */
  name: string
  /** 画像の URL（任意） */
  src?: string
  size?: AvatarSize
}

// 名前から、背景の色を決める（同じ名前なら、いつも同じ色になる）
const TONES = ['neutral', 'success', 'warning', 'error'] as const
function toneOf(name: string) {
  let sum = 0
  for (const ch of name) sum += ch.codePointAt(0) ?? 0
  return TONES[sum % TONES.length]
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  // 画像が読み込めなかったときは、頭文字に切り替える
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return showImage ? (
    <img className={`kk-avatar kk-avatar--${size}`} src={src} alt={name} onError={() => setFailed(true)} />
  ) : (
    // 頭文字は見た目だけなので、読み上げには「名前」を使う
    <span className={`kk-avatar kk-avatar--${size} kk-avatar--${toneOf(name)}`} role="img" aria-label={name}>
      <span aria-hidden="true">{getInitials(name)}</span>
    </span>
  )
}
