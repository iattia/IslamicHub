"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderHeart, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useContentLanguage } from "@/components/content-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  _count: { items: number };
};

export default function CollectionsPage() {
  const { language } = useContentLanguage();
  const arabic = language === "ar";
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const collections = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch("/api/me/collections");
      if (response.status === 401) return null;
      if (!response.ok) throw new Error();
      return (await response.json()).data as Collection[];
    },
  });

  async function createCollection(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/me/collections", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      setError(
        arabic
          ? "تعذّر إنشاء هذه المجموعة."
          : "Unable to create that collection.",
      );
      return;
    }
    setName("");
    setOpen(false);
    void client.invalidateQueries({ queryKey: ["collections"] });
  }

  if (collections.isLoading) {
    return (
      <div
        lang={language}
        dir={arabic ? "rtl" : "ltr"}
        className={cn(
          "mx-auto max-w-5xl px-4 py-16 text-muted sm:px-6",
          arabic && "arabic text-lg",
        )}
      >
        {arabic ? "جارٍ تحميل المجموعات…" : "Loading collections…"}
      </div>
    );
  }

  return (
    <div
      lang={language}
      dir={arabic ? "rtl" : "ltr"}
      className="mx-auto max-w-5xl px-4 py-10 sm:px-6"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[.16em] text-accent",
              arabic && "arabic text-base tracking-normal",
            )}
          >
            {arabic ? "المجموعات" : "Collections"}
          </p>
          <h1
            className={cn(
              "mt-2 text-4xl font-semibold tracking-tight",
              arabic && "arabic leading-[1.55] tracking-normal",
            )}
          >
            {arabic
              ? "مساحة للآيات التي تعود إليها."
              : "A home for the verses you return to."}
          </h1>
        </div>
        {collections.data && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            <span className={arabic ? "arabic text-base" : undefined}>
              {arabic ? "مجموعة جديدة" : "New collection"}
            </span>
          </Button>
        )}
      </div>

      {open && (
        <form
          onSubmit={createCollection}
          className="mt-6 flex max-w-lg flex-wrap gap-2 rounded-2xl border border-accent/40 bg-panel p-3"
        >
          <input
            autoFocus
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={arabic ? "اسم المجموعة" : "Collection name"}
            className={cn(
              "min-w-0 flex-1 bg-transparent px-2 outline-none",
              arabic && "arabic text-lg",
            )}
          />
          <Button size="sm">
            {arabic ? "إنشاء" : "Create"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setOpen(false)}
          >
            {arabic ? "إلغاء" : "Cancel"}
          </Button>
          {error && (
            <p role="alert" className="basis-full text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      )}

      {collections.data === null ? (
        <div className="mt-10 rounded-3xl border border-line bg-panel p-8">
          <FolderHeart className="size-6 text-accent" />
          <h2
            className={cn(
              "mt-6 text-xl font-semibold",
              arabic && "arabic text-2xl leading-[1.6]",
            )}
          >
            {arabic ? "اجعل مساحة الدراسة خاصة بك." : "Make your study space yours."}
          </h2>
          <p
            className={cn(
              "mt-2 max-w-lg leading-7 text-muted",
              arabic && "arabic text-lg leading-[1.9]",
            )}
          >
            {arabic
              ? "سجّل الدخول لإنشاء مجموعات خاصة وحفظ العلامات والملاحظات ومزامنتها بين أجهزتك."
              : "Sign in to create private collections, save bookmarks, and keep notes synced across your devices."}
          </p>
          <Link href="/sign-in">
            <Button className={cn("mt-6", arabic && "arabic text-base")}>
              {arabic ? "تسجيل الدخول للمتابعة" : "Sign in to continue"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {collections.data?.map((collection) => (
            <article
              key={collection.id}
              className="rounded-2xl border border-line bg-panel p-6"
            >
              <p className={cn("font-semibold", arabic && "arabic text-lg")}>
                {collection.name}
              </p>
              <p className="mt-2 text-sm text-muted">
                {collection.description ||
                  (arabic ? "لا يوجد وصف" : "No description")}
              </p>
              <p className="mt-6 text-xs text-accent">
                {arabic
                  ? `${collection._count.items.toLocaleString("ar-EG")} عنصر`
                  : `${collection._count.items} items`}
              </p>
            </article>
          ))}
          {collections.data?.length === 0 && (
            <p
              className={cn(
                "rounded-2xl border border-dashed border-line p-6 text-muted",
                arabic && "arabic text-lg leading-[1.8]",
              )}
            >
              {arabic
                ? "مجموعتك الأولى تنتظر أول آية."
                : "Your first collection is waiting for its first verse."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
