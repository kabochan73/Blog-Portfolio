import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagList } from '@/app/(admin)/dashboard/tags/TagList'
import type { Tag } from '@/types'

jest.mock('@/app/(admin)/dashboard/tags/actions', () => ({
  createTag: jest.fn(),
  updateTag: jest.fn(),
  deleteTag: jest.fn(),
}))

const mockTags: Tag[] = [
  { id: 1, name: 'Laravel', slug: 'laravel' },
  { id: 2, name: 'Next.js', slug: 'nextjs' },
]

describe('TagList', () => {
  it('タグ一覧を表示する', () => {
    render(<TagList tags={mockTags} />)
    expect(screen.getByText('Laravel')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })

  it('タグが0件のときメッセージを表示する', () => {
    render(<TagList tags={[]} />)
    expect(screen.getByText('タグがまだありません。')).toBeInTheDocument()
  })

  it('新しいタグ名の入力欄がある', () => {
    render(<TagList tags={mockTags} />)
    expect(screen.getByPlaceholderText('新しいタグ名')).toBeInTheDocument()
  })

  it('編集ボタンをクリックすると編集フォームが表示される', async () => {
    const user = userEvent.setup()
    render(<TagList tags={mockTags} />)

    await user.click(screen.getAllByRole('button', { name: '編集' })[0])

    expect(screen.getByDisplayValue('Laravel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument()
  })

  it('キャンセルボタンをクリックすると編集フォームが閉じる', async () => {
    const user = userEvent.setup()
    render(<TagList tags={mockTags} />)

    await user.click(screen.getAllByRole('button', { name: '編集' })[0])
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(screen.queryByDisplayValue('Laravel')).not.toBeInTheDocument()
    expect(screen.getByText('Laravel')).toBeInTheDocument()
  })
})
