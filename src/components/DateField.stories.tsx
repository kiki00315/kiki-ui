import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { Button } from './Button'
import { DateField } from './DateField'
import { parseDate } from './dateText'

const onChange = fn()

const meta = {
  title: 'Components/DateField',
  component: DateField,
  tags: ['autodocs'],
  // 「今日」を固定する（見本もテストも、日によって変わらないように）
  args: { label: 'ご希望の日', today: '2026-10-19', onChange },
  decorators: [(Story) => <div style={{ width: 320, minHeight: 420 }}><Story /></div>],
} satisfies Meta<typeof DateField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 打って、欄を離れると確定する／全角の数字や「年月日」でも読める、を確かめる
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'ご希望の日' })
    await userEvent.type(input, '2026/10/20')
    await userEvent.tab()
    await expect(onChange).toHaveBeenLastCalledWith('2026-10-20')
    await expect(input).toHaveValue('2026/10/20')
    await userEvent.clear(input)
    await userEvent.type(input, '２０２６年１０月２１日')
    await userEvent.keyboard('{Enter}')
    await expect(onChange).toHaveBeenLastCalledWith('2026-10-21')
    await expect(input).toHaveValue('2026/10/21')
  },
}

export const InvalidText: Story = {
  // 読めない文字・本当にない日付は、エラーになる（入力欄に結びつく）。直して確定すると、エラーが消える
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'ご希望の日' })
    await userEvent.type(input, '2026/02/30')
    await userEvent.tab()
    await expect(input).toBeInvalid()
    await expect(input).toHaveAccessibleDescription('日付の形が正しくありません（例：2026/10/20）')
    await userEvent.clear(input)
    await userEvent.type(input, '2026/02/28')
    await userEvent.tab()
    await expect(input).toBeValid()
  },
}

export const WithRange: Story = {
  args: { min: '2026-10-10', max: '2026-11-20', hint: '10月10日から 11月20日まで' },
  // 範囲の外の日付を打つと、エラーになり、onChange は呼ばれない
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'ご希望の日' })
    await userEvent.type(input, '2026/12/01')
    await userEvent.tab()
    await expect(input).toHaveAccessibleDescription(expect.stringContaining('2026/11/20 以前の日付を選んでください'))
    await expect(onChange).not.toHaveBeenCalled()
  },
}

export const PickWithCalendar: Story = {
  // ボタンでカレンダーを開く → フォーカスが今日へ → → で次の日 → Enter で選ぶ → 閉じて、フォーカスがボタンに戻り、欄に日付が入る
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    const open = canvas.getByRole('button', { name: 'カレンダーを開く' })
    await userEvent.click(open)
    const panel = await canvas.findByRole('dialog', { name: 'ご希望の日を選ぶカレンダー' })
    await expect(open).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(within(panel).getByRole('button', { name: '2026年10月19日（月）' })).toHaveFocus())
    await userEvent.keyboard('{ArrowRight}{Enter}')
    await expect(onChange).toHaveBeenLastCalledWith('2026-10-20')
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(open).toHaveFocus()
    await expect(canvas.getByRole('textbox', { name: 'ご希望の日' })).toHaveValue('2026/10/20')
  },
}

export const CloseWithEscape: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const open = canvas.getByRole('button', { name: 'カレンダーを開く' })
    await userEvent.click(open)
    await canvas.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
    await expect(open).toHaveFocus()
  },
}

export const Selected: Story = { args: { defaultValue: '2026-10-25' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-10-25' } }

// 打った文字を日付にする規則（画面なしで確かめる）
export const ParseRules: Story = {
  play: async () => {
    for (const ok of ['2026/10/20', '2026-10-20', '2026.10.20', '20261020', '２０２６／１０／２０', '2026年10月20日', ' 2026/10/20 ', '2026/1/5']) {
      await expect(parseDate(ok)).toBe(ok.includes('1/5') ? '2026-01-05' : '2026-10-20')
    }
    for (const bad of ['', 'abc', '2026/10', '2026/13/1', '2026/02/30', '2025/02/29', '99/10/20', '2026/10/20/1']) {
      await expect(parseDate(bad)).toBeNull()
    }
    // うるう年の 2 月 29 日は、ある
    await expect(parseDate('2024/02/29')).toBe('2024-02-29')
  },
}

// 親が値を持つ使い方。親が値を変えると（リセットなど）、入力欄の文字も変わる
function Controlled() {
  const [value, setValue] = useState('2026-10-25')
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <DateField label="ご希望の日" value={value} onChange={setValue} today="2026-10-19" />
      <Button size="sm" variant="secondary" onClick={() => setValue('')}>リセット</Button>
      <Button size="sm" variant="secondary" onClick={() => setValue('2026-12-24')}>12/24 にする</Button>
    </div>
  )
}

export const ControlledByParent: Story = {
  render: () => <Controlled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox', { name: 'ご希望の日' })
    await expect(input).toHaveValue('2026/10/25')
    await userEvent.click(canvas.getByRole('button', { name: '12/24 にする' }))
    await expect(input).toHaveValue('2026/12/24')
    await userEvent.click(canvas.getByRole('button', { name: 'リセット' }))
    await expect(input).toHaveValue('')
  },
}

export const NoRepeatedChange: Story = {
  // 同じ日付のまま欄を離れても、onChange は呼ばれない
  args: { defaultValue: '2026-10-25' },
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const input = within(canvasElement).getByRole('textbox', { name: 'ご希望の日' })
    await userEvent.click(input)
    await userEvent.tab()
    await expect(onChange).not.toHaveBeenCalled()
  },
}
