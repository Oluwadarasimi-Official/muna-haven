"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { saveUpdate, uploadAdminImage, type ActionState } from "@/lib/admin/actions";
import UpdateCard from "@/components/UpdateCard";

const inputCls =
  "w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-espresso placeholder:text-espresso/30";
const labelCls = "block text-sm font-medium text-espresso mb-1";

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-espresso text-ivory font-medium px-6 py-2.5 hover:bg-espresso/90 disabled:opacity-50"
    >
      {pending ? "Saving…" : editing ? "Save changes" : "Create update"}
    </button>
  );
}

export interface UpdateRow {
  id: string;
  title: string | null;
  body: string;
  image_url: string | null;
  link_url: string | null;
  published: boolean;
  scheduled_at: string | null;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function UpdateForm({ update }: { update: UpdateRow | null }) {
  const bound = saveUpdate.bind(null, update?.id ?? null);
  const [state, formAction] = useFormState<ActionState, FormData>(bound, {
    ok: true,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(update?.image_url ?? "");
  // Live preview values (what the public will see).
  const [title, setTitle] = useState(update?.title ?? "");
  const [body, setBody] = useState(update?.body ?? "");

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadAdminImage(fd, "updates");
    setUploading(false);
    if (res.ok) setImageUrl(res.url);
    else setUploadError(res.error);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form action={formAction} className="space-y-5">
        <div className="rounded-2xl bg-blush/15 border border-blush/40 p-4 text-sm text-espresso/80">
          <p className="font-medium text-espresso mb-1">Source: manual</p>
          <p>
            Updates you write here appear on the public Updates page. There is
            no automatic sync with the WhatsApp channel — paste announcements
            manually (see the channel note in Settings).
          </p>
        </div>

        <div>
          <label htmlFor="title" className={labelCls}>
            Title (optional)
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="e.g. New arrivals this weekend"
          />
        </div>

        <div>
          <label htmlFor="body" className={labelCls}>
            Body *
          </label>
          <textarea
            id="body"
            name="body"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className={inputCls}
            placeholder="What should customers know?"
          />
          {state.errors?.body && (
            <p className="text-xs text-red-700 mt-1">{state.errors.body}</p>
          )}
        </div>

        <div>
          <label htmlFor="image_url" className={labelCls}>
            Image
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputCls}
            placeholder="https://… or upload below"
          />
          <div className="flex items-center gap-3 mt-2">
            <label className="rounded-xl border border-espresso/20 px-4 py-2 text-sm font-medium text-espresso cursor-pointer hover:bg-ivory">
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onUpload}
                disabled={uploading}
              />
            </label>
            <span className="text-xs text-espresso/50">Max 5MB. Uploads to updates/.</span>
          </div>
          {uploadError && <p className="text-xs text-red-700 mt-1">{uploadError}</p>}
          {imageUrl && (
            <div className="mt-3 relative w-40">
              <Image
                src={imageUrl}
                alt="Update image preview"
                width={160}
                height={160}
                className="rounded-xl object-cover aspect-square"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-1 right-1 rounded-full bg-white/90 text-red-700 text-xs px-2 py-0.5"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="link_url" className={labelCls}>
            Link URL (optional)
          </label>
          <input
            id="link_url"
            name="link_url"
            type="url"
            defaultValue={state.values?.link_url ?? update?.link_url ?? ""}
            className={inputCls}
            placeholder="https://…"
          />
        </div>

        <div>
          <label htmlFor="scheduled_at" className={labelCls}>
            Schedule for (optional — leave blank to show immediately)
          </label>
          <input
            id="scheduled_at"
            name="scheduled_at"
            type="datetime-local"
            defaultValue={state.values?.scheduled_at ?? toDatetimeLocal(update?.scheduled_at ?? null)}
            className={inputCls}
          />
          {state.errors?.scheduled_at && (
            <p className="text-xs text-red-700 mt-1">{state.errors.scheduled_at}</p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-espresso">
          <input
            type="checkbox"
            name="published"
            defaultChecked={update?.published ?? false}
            className="h-4 w-4 accent-[#382724]"
          />
          Published (visible on the Updates page)
        </label>

        <div className="flex items-center gap-3">
          <SubmitButton editing={!!update} />
          <Link
            href="/admin/updates"
            className="rounded-xl border border-espresso/20 px-6 py-2.5 text-sm font-medium text-espresso hover:bg-white"
          >
            Cancel
          </Link>
        </div>
      </form>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-espresso/50 mb-3">
          Public preview
        </h2>
        <UpdateCard
          update={{
            id: update?.id ?? "preview",
            title: title || null,
            body: body || "Your update text will appear here…",
            image_url: imageUrl || null,
            link_url: null,
            published: true,
            published_at: new Date().toISOString(),
            scheduled_at: null,
            source: "manual",
            source_external_id: null,
            created_at: new Date().toISOString(),
          }}
        />
      </div>
    </div>
  );
}
