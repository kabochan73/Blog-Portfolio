import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterSidebar } from '@/app/_components/FilterSidebar'
import type { Tag } from '@/types'

const mockTags: Tag[] = [
  { id: 1, name: 'Laravel', slug: 'laravel' },
  { id: 2, name: 'Next.js', slug: 'nextjs' },
]

describe('FilterSidebar', () => {
  it('検索欄とタグボタンを表示する', () => {
    render(
      <FilterSidebar
        query=""
        selectedTag={null}
        tags={mockTags}
        onQueryChange={jest.fn()}
        onTagClick={jest.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('記事を検索...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Laravel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next.js' })).toBeInTheDocument()
  })

  it('タグが空のときメッセージを表示する', () => {
    render(
      <FilterSidebar
        query=""
        selectedTag={null}
        tags={[]}
        onQueryChange={jest.fn()}
        onTagClick={jest.fn()}
      />,
    )
    expect(screen.getByText('タグがありません')).toBeInTheDocument()
  })

  it('検索欄に入力すると onQueryChange が呼ばれる', async () => {
    const user = userEvent.setup()
    const onQueryChange = jest.fn()
    render(
      <FilterSidebar
        query=""
        selectedTag={null}
        tags={mockTags}
        onQueryChange={onQueryChange}
        onTagClick={jest.fn()}
      />,
    )
    await user.type(screen.getByPlaceholderText('記事を検索...'), 'L')
    expect(onQueryChange).toHaveBeenCalledWith('L')
  })

  it('タグをクリックすると onTagClick が呼ばれる', async () => {
    const user = userEvent.setup()
    const onTagClick = jest.fn()
    render(
      <FilterSidebar
        query=""
        selectedTag={null}
        tags={mockTags}
        onQueryChange={jest.fn()}
        onTagClick={onTagClick}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Laravel' }))
    expect(onTagClick).toHaveBeenCalledWith(1)
  })

  it('selectedTag と一致するタグボタンがアクティブスタイルになる', () => {
    render(
      <FilterSidebar
        query=""
        selectedTag={1}
        tags={mockTags}
        onQueryChange={jest.fn()}
        onTagClick={jest.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Laravel' })).toHaveClass('bg-gray-900')
    expect(screen.getByRole('button', { name: 'Next.js' })).not.toHaveClass('bg-gray-900')
  })

  it('placeholder props で検索欄のプレースホルダーを変更できる', () => {
    render(
      <FilterSidebar
        query=""
        selectedTag={null}
        tags={mockTags}
        placeholder="下書きを検索..."
        onQueryChange={jest.fn()}
        onTagClick={jest.fn()}
      />,
    )
    expect(screen.getByPlaceholderText('下書きを検索...')).toBeInTheDocument()
  })
})
