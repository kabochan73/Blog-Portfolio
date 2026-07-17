export type PostStatus = "draft" | "published";

export type Tag = {
  id: number;
  name: string;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  body: string;
  status: PostStatus;
  tags: Tag[];
  created_at: string;
  updated_at: string;
};
