import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { RangeCalendar } from './RangeCalendar'

const onChange = fn()

const meta = {
  title: 'Components/RangeCalendar',
  component: RangeCalendar,
  tags: ['autodocs'],
  args: { 'aria-label': 'ご利用期間', today: '2026-10-19', onChange },
} satisfies Meta<typeof RangeCalendar>

export default meta
type Story = StoryObj<typeof meta>

const day = (canvas: ReturnType<typeof within>, name: string) => canvas.getByRole('button', { name })
const cellOf = (el: HTMLElement) => el.closest('[role="gridcell"]')

export const Default: Story = {
  // 1 回目で開始日／2 回目で終了日。そのあいだの日が、全部 aria-selected になる
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(day(canvas, '2026年10月13日（火）'))
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-13', end: null })
    await expect(canvas.getByRole('status')).toHaveTextContent('開始日を2026年10月13日にしました。終了日を選んでください')
    await userEvent.click(day(canvas, '2026年10月16日（金）'))
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-13', end: '2026-10-16' })
    await expect(canvas.getByRole('status')).toHaveTextContent('2026年10月13日から2026年10月16日までを選びました')
    for (const d of ['13日（火）', '14日（水）', '15日（木）', '16日（金）']) {
      await expect(cellOf(day(canvas, `2026年10月${d}`))).toHaveAttribute('aria-selected', 'true')
    }
    await expect(cellOf(day(canvas, '2026年10月12日（月）'))).toHaveAttribute('aria-selected', 'false')
    await expect(cellOf(day(canvas, '2026年10月17日（土）'))).toHaveAttribute('aria-selected', 'false')
    // はじめ・おわりの印と、まん中の印
    await expect(cellOf(day(canvas, '2026年10月13日（火）'))).toHaveAttribute('data-edge', 'start')
    await expect(cellOf(day(canvas, '2026年10月16日（金）'))).toHaveAttribute('data-edge', 'end')
    await expect(cellOf(day(canvas, '2026年10月14日（水）'))).toHaveAttribute('data-in-range', 'true')
  },
}

export const KeyboardFlow: Story = {
  // キーボードだけで：矢印で動いて Enter（開始日）→ 矢印で動いて Enter（終了日）
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    day(canvas, '2026年10月19日（月）').focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{Enter}')
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-19', end: '2026-10-27' })
  },
}

export const PickEarlierRestarts: Story = {
  // 開始日より前の日を押したら、そちらが新しい開始日になる。期間がそろったあとに押したときも、やり直し
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(day(canvas, '2026年10月20日（火）'))
    await userEvent.click(day(canvas, '2026年10月10日（土）'))
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-10', end: null })
    await userEvent.click(day(canvas, '2026年10月12日（月）'))
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-10', end: '2026-10-12' })
    await userEvent.click(day(canvas, '2026年10月28日（水）'))
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-28', end: null })
  },
}

export const SameDay: Story = {
  // 同じ日を 2 回押すと、1 日だけの期間
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(day(canvas, '2026年10月21日（水）'))
    await userEvent.click(day(canvas, '2026年10月21日（水）'))
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-21', end: '2026-10-21' })
    await expect(cellOf(day(canvas, '2026年10月21日（水）'))).toHaveAttribute('data-edge', 'single')
  },
}

export const AcrossMonths: Story = {
  // 月をまたぐ期間：次の月に進んで、終了日を選ぶ
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    await userEvent.click(day(canvas, '2026年10月29日（木）'))
    await userEvent.click(canvas.getByRole('button', { name: '次の月' }))
    await userEvent.click(day(canvas, '2026年11月3日（火）'))
    await expect(onChange).toHaveBeenLastCalledWith({ start: '2026-10-29', end: '2026-11-03' })
    // 11 月の 1・2 日も、期間の中なので、選ばれている
    await expect(cellOf(day(canvas, '2026年11月2日（月）'))).toHaveAttribute('aria-selected', 'true')
  },
}

export const Preset: Story = { args: { defaultValue: { start: '2026-10-12', end: '2026-10-16' } } }
export const WithRange: Story = { args: { min: '2026-10-10', max: '2026-11-20' } }
export const MondayStart: Story = { args: { weekStart: 1, defaultValue: { start: '2026-10-12', end: '2026-10-18' } } }
