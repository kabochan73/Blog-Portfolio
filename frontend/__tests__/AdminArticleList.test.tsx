import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminArticleList } from '@/app/(admin)/dashboard/_components/AdminArticleList'
import type { Article, Tag } from '@/types'

jest.mock('@/app/(admin)/dashboard/articles/actions', () => ({
  deleteArticle: jest.fn(),
}))

const mockTags: Tag[] = [
  { id: 1, name: 'Laravel', slug: 'laravel' },
  { id: 2, name: 'Next.js', slug: 'nextjs' },
]

const mockArticles: Article[] = [
  {
    id: 1,
    title: 'Laravel入門',
    content: '本文',
    slug: 'laravel-intro',
    status: 'published',
    published_at: '2024-01-01T00:00:00.000Z',
    tags: [mockTags[0]],
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Next.js入門',
    content: '本文',
    slug: 'nextjs-intro',
    status: 'published',
    published_at: '2024-01-02T00:00:00.000Z',
    tags: [mockTags[1]],
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'TypeScript基礎',
    content: '本文',
    slug: 'typescript-basics',
    status: 'published',
    published_at: '2024-01-03T00:00:00.000Z',
    tags: [],
    created_at: '2024-01-03T00:00:00.000Z',
    updated_at: '2024-01-03T00:00:00.000Z',
  },
]

describe('AdminArticleList', () => {
  it('記事一覧を表示する', () => {
    render(<AdminArticleList articles={mockArticles} tags={mockTags} />)
    expect(screen.getByText('Laravel入門')).toBeInTheDocument()
    expect(screen.getByText('Next.js入門')).toBeInTheDocument()
    expect(screen.getByText('TypeScript基礎')).toBeInTheDocument()
  })

  it('記事が0件のとき emptyText を表示する', () => {
    render(<AdminArticleList articles={[]} tags={[]} emptyText="下書きはありません。" />)
    expect(screen.getByText('下書きはありません。')).toBeInTheDocument()
  })

  it('タイトルで記事を絞り込める', async () => {
    const user = userEvent.setup()
    render(<AdminArticleList articles={mockArticles} tags={mockTags} />)

    await user.type(screen.getByPlaceholderText('記事を検索...'), 'Laravel')

    expect(screen.getByText('Laravel入門')).toBeInTheDocument()
    expect(screen.queryByText('Next.js入門')).not.toBeInTheDocument()
    expect(screen.queryByText('TypeScript基礎')).not.toBeInTheDocument()
  })

  it('タグをクリックして絞り込める', async () => {
    const user = userEvent.setup()
    render(<AdminArticleList articles={mockArticles} tags={mockTags} />)

    await user.click(screen.getAllByRole('button', { name: 'Next.js' })[0])

    expect(screen.getByText('Next.js入門')).toBeInTheDocument()
    expect(screen.queryByText('Laravel入門')).not.toBeInTheDocument()
    expect(screen.queryByText('TypeScript基礎')).not.toBeInTheDocument()
  })

  it('同じタグを再クリックすると絞り込みが解除される', async () => {
    const user = userEvent.setup()
    render(<AdminArticleList articles={mockArticles} tags={mockTags} />)

    await user.click(screen.getAllByRole('button', { name: 'Next.js' })[0])
    await user.click(screen.getAllByRole('button', { name: 'Next.js' })[0])

    expect(screen.getByText('Laravel入門')).toBeInTheDocument()
    expect(screen.getByText('Next.js入門')).toBeInTheDocument()
    expect(screen.getByText('TypeScript基礎')).toBeInTheDocument()
  })

  it('各記事のタイトルが編集ページへのリンクになっている', () => {
    render(<AdminArticleList articles={mockArticles} tags={mockTags} />)
    expect(screen.getByRole('link', { name: 'Laravel入門' })).toHaveAttribute(
      'href',
      '/dashboard/articles/1/edit',
    )
  })
})
