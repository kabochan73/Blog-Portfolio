"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setToken } from "@/lib/auth.client";

const schema = z.object({
  email: z.email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginError, setLoginError] = useState<string | null>(() =>
    searchParams.get("expired")
      ? "セッションの有効期限が切れました。再度ログインしてください。"
      : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setLoginError(null);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setLoginError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    const { token } = await res.json();
    setToken(token);
    router.push("/admin");
  };

  return (
    <div className="flex min-h-full w-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50">
        <h1 className="text-center text-2xl font-bold tracking-tight">
          ログイン
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 flex flex-col gap-5"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          {loginError && (
            <p className="text-sm text-red-600">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
