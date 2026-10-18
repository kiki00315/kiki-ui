import type { KeyboardEvent } from 'react'

// 日本語などの入力で、「変換の途中」のキー操作かどうか。
// 変換を確定する Enter や、変換候補を選ぶ ↑↓ を、部品の操作（タグの追加・候補の移動など）と、取りちがえないために使う。
//   ・Chrome・Firefox：変換中のキーは、isComposing が true になる
//   ・Safari：変換を確定する Enter の keydown は、compositionend の「あと」に来て、isComposing が false になる。
//     そのかわり、keyCode が 229 になるので、これも見る（keyCode は古い書き方だが、この見分けには今も使われる）
export function isComposingKey(e: KeyboardEvent): boolean {
  return e.nativeEvent.isComposing || e.keyCode === 229
}
