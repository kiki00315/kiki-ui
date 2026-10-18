import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index'
import { Button, Card } from './index'

// 動作確認用の小さなページ（カタログは Storybook で見る）
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ padding: 40, background: 'var(--color-bg)', minHeight: '100vh', display: 'grid', gap: 24, justifyItems: 'start' }}>
      <Button>お問い合わせ</Button>
      <Card kind="ウェブツール" title="色見本ジェネレーター" href="#" />
    </div>
  </StrictMode>,
)
