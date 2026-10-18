import type { Preview } from '@storybook/react-vite'
import '../src/tokens.css'

const preview: Preview = {
  initialGlobals: { backgrounds: { value: 'paper' } },
  parameters: {
    // ポートフォリオと同じ、紙の色の背景で見せる
    backgrounds: { options: { paper: { name: 'paper', value: '#FAF9F6' } } },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;