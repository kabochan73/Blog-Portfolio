"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { listAdminTags } from "@/lib/api.tags.client";
import { ApiError } from "@/lib/api.client";
import type { PostInput } from "@/lib/api.posts.client";
import type { Post, Tag } from "@/types";

const schema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(25, "25文字以内で入力してください"),
  slug: z
    .string()
    .min(1, "スラグを入力してください")
    .max(25, "25文字以内で入力してください")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "半角英数字・ハイフン・アンダースコアのみ使用できます"
    ),
  body: z.string().min(1, "本文を入力してください"),
  status: z.enum(["draft", "published"]),
  tag_ids: z.array(z.number()),
});

type FormValues = z.infer<typeof schema>;

export function PostForm({
  initialPost,
  onSubmit,
  submitLabel,
}: {
  initialPost?: Post;
  onSubmit: (input: PostInput) => Promise<void>;
  submitLabel: string;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialPost?.title ?? "",
      slug: initialPost?.slug ?? "",
      body: initialPost?.body ?? "",
      status: initialPost?.status ?? "draft",
      tag_ids: initialPost?.tags.map((tag) => tag.id) ?? [],
    },
  });

  useEffect(() => {
    listAdminTags().then(setTags);
  }, []);

  const bodyValue = useWatch({ control, name: "body" });
  const tagIds = useWatch({ control, name: "tag_ids" });
  const statusValue = useWatch({ control, name: "status" });

  const submit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      await onSubmit({
        title: values.title,
        slug: values.slug,
        body: values.body,
        status: values.status,
        tag_ids: values.tag_ids,
      });
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        let hasFieldError = false;
        for (const [field, messages] of Object.entries(e.errors)) {
          if (field in schema.shape && messages[0]) {
            setError(field as keyof FormValues, { message: messages[0] });
            hasFieldError = true;
          }
        }
        if (!hasFieldError) {
          setSubmitError(e.message);
        }
        return;
      }
      setSubmitError(e instanceof Error ? e.message : "保存に失敗しました");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="block text-sm">
          タイトル
        </label>
        <input
          id="title"
          {...register("title")}
          className="mt-1 w-full border border-zinc-300 px-2 py-1"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm">
          スラグ
        </label>
        <input
          id="slug"
          {...register("slug")}
          className="mt-1 w-full border border-zinc-300 px-2 py-1"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={tab === "edit" ? "font-semibold" : "text-zinc-500"}
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={tab === "preview" ? "font-semibold" : "text-zinc-500"}
          >
            プレビュー
          </button>
        </div>
        {tab === "edit" ? (
          <textarea
            {...register("body")}
            rows={12}
            className="mt-1 w-full border border-zinc-300 px-2 py-1 font-mono text-sm"
          />
        ) : (
          <div className="prose mt-1 min-h-200px max-w-none border border-zinc-300 px-2 py-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {bodyValue}
            </ReactMarkdown>
          </div>
        )}
        {errors.body && (
          <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
        )}
      </div>

      <div>
        <span className="block text-sm">タグ</span>
        <div className="mt-1 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={tagIds.includes(tag.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...tagIds, tag.id]
                    : tagIds.filter((id) => id !== tag.id);
                  setValue("tag_ids", next);
                }}
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-sm">ステータス</span>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setValue("status", "draft")}
            className={
              statusValue === "draft"
                ? "bg-black px-3 py-1 text-sm text-white"
                : "border border-zinc-300 px-3 py-1 text-sm"
            }
          >
            下書き
          </button>
          <button
            type="button"
            onClick={() => setValue("status", "published")}
            className={
              statusValue === "published"
                ? "bg-black px-3 py-1 text-sm text-white"
                : "border border-zinc-300 px-3 py-1 text-sm"
            }
          >
            公開
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto bg-black px-4 py-2 text-white font-bold disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
    </form>
  );
}
