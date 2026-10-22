import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Calendar } from './Calendar'
import { addMonths, monthWeeks, weekdayHeaders } from './calendarDates'

const onChange = fn()

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  // 「今日」を固定する（本物の今日だと、見本もテストも、日によって変わってしまうため）
  args: { 'aria-label': 'ご希望の日', today: '2026-10-19', onChange },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  // 今日が目印／フォーカスの置き場所は今日の 1 か所／矢印で日が動く／月の端をこえると、月が変わる／Enter で選べる、を確かめる
  play: async ({ canvasElement }) => {
    onChange.mockClear()
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('group', { name: 'ご希望の日' })).toBeInTheDocument()
    await expect(canvas.getByRole('grid', { name: '2026年10月' })).toBeInTheDocument()
    const today = canvas.getByRole('button', { name: '2026年10月19日（月）' })
    await expect(today).toHaveAttribute('aria-current', 'date')
    // フォーカスの置き場所（tabindex=0）は、今日の 1 か所だけ。前の月・次の月のボタンを通ったあと、Tab で今日に着く
    await expect(today).toHaveAttribute('tabindex', '0')
    await expect(canvas.getByRole('button', { name: '2026年10月20日（火）' })).toHaveAttribute('tabindex', '-1')
    today.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('button', { name: '2026年10月20日（火）' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('button', { name: '2026年10月27日（火）' })).toHaveFocus()
    // 週のはじめ（日曜）と、おわり（土曜）へ
    await userEvent.keyboard('{Home}')
    await expect(canvas.getByRole('button', { name: '2026年10月25日（日）' })).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(canvas.getByRole('button', { name: '2026年10月31日（土）' })).toHaveFocus()
    // 10 月の最後の日から → で、11 月へ（見出しが変わる）
    await userEvent.keyboard('{ArrowRight}')
    await expect(canvas.getByRole('grid', { name: '2026年11月' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: '2026年11月1日（日）' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(onChange).toHaveBeenLastCalledWith('2026-11-01')
    // 選ばれたことは、日のボタンを包むセル（gridcell）の aria-selected で伝わる
    await expect(canvas.getByRole('button', { name: '2026年11月1日（日）' }).closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true')
  },
}

export const PageKeys: Story = {
  // PageDown で次の月（日にちは同じ。ない日は月末）、Shift + PageUp で前の年
  args: { defaultValue: '2026-01-31' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    canvas.getByRole('button', { name: '2026年1月31日（土）' }).focus()
    await userEvent.keyboard('{PageDown}')
    await expect(canvas.getByRole('button', { name: '2026年2月28日（土）' })).toHaveFocus()
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}')
    await expect(canvas.getByRole('button', { name: '2025年2月28日（金）' })).toHaveFocus()
  },
}

export const WithRange: Story = {
  // 範囲の外の日は選べない。月を切り替えるボタンも、範囲の外へは進めない
  args: { min: '2026-10-10', max: '2026-11-20' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: '2026年10月9日（金）' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: '2026年10月10日（土）' })).toBeEnabled()
    await expect(canvas.getByRole('button', { name: '前の月' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('button', { name: '次の月' }))
    await expect(canvas.getByRole('grid', { name: '2026年11月' })).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: '2026年11月21日（土）' })).toBeDisabled()
    await expect(canvas.getByRole('button', { name: '次の月' })).toBeDisabled()
  },
}

export const Selected: Story = { args: { defaultValue: '2026-10-25' } }

// 日付の計算（画面なしで確かめる）
export const DateRules: Story = {
  play: async () => {
    await expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    await expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
    await expect(addMonths('2026-12-15', 1)).toBe('2027-01-15')
    await expect(addMonths('2026-01-15', -1)).toBe('2025-12-15')
    // 2026 年 10 月は、1 日が木曜・31 日まで。日曜はじまりで 5 週
    const weeks = monthWeeks(2026, 9)
    await expect(weeks).toHaveLength(5)
    await expect(weeks[0]).toEqual([null, null, null, null, 1, 2, 3])
    await expect(weeks[4].slice(0, 7)).toEqual([25, 26, 27, 28, 29, 30, 31])
  },
}

export const MondayStart: Story = {
  // 週のはじまりを月曜にする：曜日の並びが「月火水木金土日」になる／Home・End が、月曜・日曜へ行く
  args: { weekStart: 1 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['月', '火', '水', '木', '金', '土', '日'])
    // 2026 年 10 月 1 日は木曜日 → 月曜はじまりでは、1 週目の 4 番目（前に 3 つの空き）
    const first = canvas.getByRole('button', { name: '2026年10月1日（木）' }).closest('tr')!
    await expect(within(first as HTMLElement).getAllByRole('gridcell')).toHaveLength(4)
    canvas.getByRole('button', { name: '2026年10月21日（水）' }).focus()
    await userEvent.keyboard('{Home}')
    await expect(canvas.getByRole('button', { name: '2026年10月19日（月）' })).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(canvas.getByRole('button', { name: '2026年10月25日（日）' })).toHaveFocus()
  },
}

export const WeekRules: Story = {
  // 月曜はじまりの並びの計算（画面なしで確かめる）
  play: async () => {
    await expect(weekdayHeaders(1).map((w) => w.short)).toEqual(['月', '火', '水', '木', '金', '土', '日'])
    // 2026 年 10 月は、1 日が木曜：日曜はじまりなら 4 つ、月曜はじまりなら 3 つの空きから始まる
    await expect(monthWeeks(2026, 9, 0)[0]).toEqual([null, null, null, null, 1, 2, 3])
    await expect(monthWeeks(2026, 9, 1)[0]).toEqual([null, null, null, 1, 2, 3, 4])
    // 月曜はじまりでは、10 月 31 日（土）が最後の週の 6 番目
    const last = monthWeeks(2026, 9, 1).at(-1)!
    await expect(last).toEqual([26, 27, 28, 29, 30, 31, null])
  },
}
