# kiki-ui

KIKI ポートフォリオのデザインを「デザイントークン」と「UI コンポーネント」にした、React + TypeScript のデザインシステムです。Storybook でカタログにしています。

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
| `src/components/Modal.tsx` | HTML 標準の `<dialog>` を使う。フォーカスの閉じ込め・Esc で閉じる・閉じたあとフォーカスを戻す、をブラウザに任せる |
| `src/*.stories.tsx` | Storybook の見本。TextField と Modal には操作のテストも入れている |

## 動かす

```bash
npm install
npm run storybook        # http://localhost:6006 でカタログを見る
npm run build            # 型のチェックとビルド
npx vitest run           # Storybook の操作テスト（Chromium で動かす）
npm run build-storybook  # カタログを storybook-static/ に書き出す
```

## フォントについて

ポートフォリオの文字は「しろくまフォント」ですが、配布元の規約で再配布できないため、このリポジトリには入れていません。`--font-main` は、しろくまフォントが無い環境では丸ゴシックで表示されます。

## これから足すもの（予定）

Badge、Tooltip、スペーシングや文字サイズのトークン一覧ページ
