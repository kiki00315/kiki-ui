# kiki-ui

KIKI ポートフォリオのデザインを「デザイントークン」と「UI コンポーネント」にした、React + TypeScript のデザインシステムです。Storybook でカタログにしています。

- カタログ（Storybook）：https://kiki00315.github.io/kiki-ui/

## 考え方

- 色・文字・余白は `src/tokens.css` の CSS 変数だけで決めます（値は、ポートフォリオの `css/style.css` から写したものです）
- コンポーネントは、色や余白の数字を直接書かず、必ずトークンを使います
- 見た目の種類は型で決めます。`variant="danger"` のように、決めていない値を書くとエラーになります

```tsx
<Button variant="primary" size="md">お問い合わせ</Button>   // OK
<Button variant="danger">…</Button>                          // 型エラー
```

## 中身

| 場所 | 内容 |
|---|---|
| `src/tokens.css` | 色・文字・余白・角・影のトークン |
| `src/components/Button.tsx` | `variant`: primary / secondary / ghost、`size`: sm / md |
| `src/components/Card.tsx` | Works ページの作品カードと同じ形（絵・種類・名前・「見る」） |
| `src/components/TextField.tsx` | label・ヒント・エラーを入力欄に結びつける（`aria-describedby` / `aria-invalid`） |
| `src/components/Select.tsx` | ブラウザ標準の `<select>`。label・ヒント・エラーの付け方は TextField と同じ |
| `src/components/Toast.tsx` | `<ToastProvider>` で包み、`useToast().show('保存しました', { variant: 'success' })` で出す。マウス・フォーカス中は消えない。エラーは `role="alert"` |
| `src/components/Tabs.tsx` | ← → Home End で動く、WAI-ARIA のタブ。開いているタブにだけ Tab で止まる |
| `src/components/Checkbox.tsx` | 標準の checkbox。名前を押しても切り替わる。`indeterminate`（一部だけ選ばれている）に対応 |
| `src/components/RadioGroup.tsx` | `<fieldset>` + `<legend>` でまとめたラジオ。↑↓ キーでの移動は標準のまま |
| `src/components/Switch.tsx` | `role="switch"` の checkbox。Space で切り替わり、オン・オフが読み上げられる |
| `src/components/Accordion.tsx` | 見出しの中のボタン + `aria-expanded`。`multiple` で複数同時に開ける |
| `src/components/Pagination.tsx` | `<nav>` + `aria-current="page"`。ページが多いときは「…」で省く |
| `src/components/Breadcrumb.tsx` | `<nav>` + `<ol>`。いまいるページは `aria-current="page"` でリンクにしない。区切りは線で描く |
| `src/components/Skeleton.tsx` | 読み込み中の場所取り（text / rect / circle）。`aria-hidden`、動きを減らす設定では光を止める |
| `src/components/Progress.tsx` | 標準の `<progress>`。値がないときは「どれくらいかわからない」動きになる |
| `src/components/Alert.tsx` | ページの中に置く動かないお知らせ。`variant` ごとに色 + 読み上げ用の文字。失敗・注意は `role="alert"` |
| `src/components/Avatar.tsx` | 画像、読み込めないとき・画像なしのときは頭文字。`name` で読み上げる |
| `src/components/DropdownMenu.tsx` | WAI-ARIA のメニューボタン。↑↓ Home End・Esc で閉じてボタンに戻る・Tab で閉じる |
| `src/components/Combobox.tsx` | WAI-ARIA のコンボボックス。文字で候補を絞る、↑↓ で選ぶ（フォーカスは入力欄のまま）、Enter で決める、Esc で閉じて元の文字に戻す |
| `src/components/ConfirmDialog.tsx` | Modal の上の「実行しますか？」。取り消せない操作（`danger`）では、最初のフォーカスが「キャンセル」に行く |
| `src/components/DatePicker.tsx` | 標準の `<input type="date">` を土台にする（自作のカレンダーは作らない）。`min` / `max` の範囲の外は、エラーを自動で出す |
| `src/components/Badge.tsx` | `variant`: neutral / success / warning / error。色と文字の組み合わせは 4.5:1 以上 |
| `src/components/Tooltip.tsx` | マウスを乗せる・フォーカスで出る、Esc で消せる。`aria-describedby` で読み上げにも対応 |
| `src/components/Modal.tsx` | HTML 標準の `<dialog>` を使う。フォーカスの閉じ込め・Esc で閉じる・閉じたあとフォーカスを戻す、をブラウザに任せる |
| `src/tokens.stories.tsx` `spacing.stories.tsx` `typography.stories.tsx` `radius.stories.tsx` `shadow.stories.tsx` | 色・余白・文字サイズ・角丸・影のトークン一覧（値は CSS 変数から読むので、`tokens.css` を変えると自動で変わる） |
| `src/components/*.stories.tsx` | Storybook の見本。ほとんどのコンポーネントに、操作のテスト（キーボード操作・読み上げ用の属性）も入れている |

## 動かす

```bash
npm install
npm run storybook        # http://localhost:6006 でカタログを見る
npm run build            # 型のチェックとビルド
npx vitest run           # Storybook の操作テスト（Chromium で動かす）
npm run build-storybook  # カタログを storybook-static/ に書き出す（main に反映すると、GitHub Actions が自動で公開する）
```

## フォントについて

ポートフォリオの文字は「しろくまフォント」ですが、配布元の規約で再配布できないため、このリポジトリには入れていません。`--font-main` は、しろくまフォントが無い環境では丸ゴシックで表示されます。

## これから足すもの（予定）

Table、Drawer（横から出るパネル）、Tree など
