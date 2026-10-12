"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import ConfirmButton from "@/components/admin/ConfirmButton";
import type { ActionState } from "@/lib/admin/actions";
import type { Category } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-espresso placeholder:text-espresso/30";
const labelCls = "block text-sm font-medium text-espresso mb-1";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-espresso text-ivory text-sm font-medium px-5 py-2.5 hover:bg-espresso/90 disabled:opacity-50"
    >
      {pending ? "Saving…" : editing ? "Save" : "Add category"}
    </button>
  );
}

function CategoryForm({
  category,
  saveCategory,
  onDone,
}: {
  category: Category | null;
  saveCategory: (
    id: string | null,
    prev: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
  onDone: () => void;
}) {
  const bound = saveCategory.bind(null, category?.id ?? null);
  const [state, formAction] = useFormState<ActionState, FormData>(bound, {
    ok: true,
  });
  const [slugTouched, setSlugTouched] = useState(!!category);

  return (
    <form
      action={formAction}
      className="rounded-2xl bg-white border border-espresso/10 p-5 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor={`name-${category?.id ?? "new"}`}>
            Name *
          </label>
          <input
            id={`name-${category?.id ?? "new"}`}
            name="name"
            defaultValue={state.values?.name ?? category?.name ?? ""}
            onChange={(e) => {
              if (!slugTouched) {
                const slugInput = document.getElementById(
                  `slug-${category?.id ?? "new"}`
                ) as HTMLInputElement | null;
                if (slugInput) {
                  slugInput.value = e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/[\s_]+/g, "-")
                    .replace(/-+/g, "-");
                }
              }
            }}
            required
            className={inputCls}
            placeholder="e.g. Wigs"
          />
          {state.errors?.name && (
            <p className="text-xs text-red-700 mt-1">{state.errors.name}</p>
          )}
        </div>
        <div>
          <label className={labelCls} htmlFor={`slug-${category?.id ?? "new"}`}>
            Slug *
          </label>
          <input
            id={`slug-${category?.id ?? "new"}`}
            name="slug"
            defaultValue={state.values?.slug ?? category?.slug ?? ""}
            onChange={() => setSlugTouched(true)}
            required
            className={inputCls}
            placeholder="auto-generated"
          />
          {state.errors?.slug && (
            <p className="text-xs text-red-700 mt-1">{state.errors.slug}</p>
          )}
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor={`desc-${category?.id ?? "new"}`}>
          Description
        </label>
        <textarea
          id={`desc-${category?.id ?? "new"}`}
          name="description"
          rows={2}
          defaultValue={state.values?.description ?? category?.description ?? ""}
          className={inputCls}
        />
      </div>
      <div className="w-40">
        <label className={labelCls} htmlFor={`sort-${category?.id ?? "new"}`}>
          Sort order
        </label>
        <input
          id={`sort-${category?.id ?? "new"}`}
          name="sort_order"
          type="number"
          step={1}
          defaultValue={state.values?.sort_order ?? category?.sort_order ?? 0}
          className={inputCls}
        />
        {state.errors?.sort_order && (
          <p className="text-xs text-red-700 mt-1">{state.errors.sort_order}</p>
        )}
      </div>
      <div className="flex gap-3">
        <SaveButton editing={!!category} />
        {category && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-espresso/20 px-5 py-2.5 text-sm font-medium text-espresso"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function CategoryManager({
  categories,
  counts,
  saveCategory,
  deleteCategory,
}: {
  categories: Category[];
  counts: Record<string, number>;
  saveCategory: (
    id: string | null,
    prev: ActionState,
    formData: FormData
  ) => Promise<ActionState>;
  deleteCategory: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowNew((v) => !v)}
        className="rounded-xl bg-espresso text-ivory text-sm font-medium px-4 py-2.5 hover:bg-espresso/90"
      >
        {showNew ? "Hide form" : "+ New category"}
      </button>
      {showNew && (
        <CategoryForm
          category={null}
          saveCategory={saveCategory}
          onDone={() => setShowNew(false)}
        />
      )}

      <div className="rounded-2xl bg-white border border-espresso/10 divide-y divide-espresso/10 overflow-hidden">
        {categories.length === 0 && (
          <p className="p-5 text-sm text-espresso/50">No categories yet.</p>
        )}
        {categories.map((c) => (
          <div key={c.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-espresso">{c.name}</p>
                <p className="text-xs text-espresso/50">
                  /{c.slug} · sort {c.sort_order} · {counts[c.id] ?? 0} product
                  {(counts[c.id] ?? 0) === 1 ? "" : "s"}
                </p>
                {c.description && (
                  <p className="text-sm text-espresso/70 mt-1 line-clamp-2">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === c.id ? null : c.id)}
                  className="rounded-lg border border-espresso/20 px-3 py-1.5 text-xs font-medium text-espresso hover:bg-ivory"
                >
                  Edit
                </button>
                <ConfirmButton
                  action={deleteCategory.bind(null, c.id)}
                  title="Delete category?"
                  body={
                    (counts[c.id] ?? 0) > 0
                      ? `“${c.name}” still has ${counts[c.id]} product(s). Move or delete them first.`
                      : `“${c.name}” will be permanently deleted.`
                  }
                  confirmLabel="Delete"
                  danger
                >
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </ConfirmButton>
              </div>
            </div>
            {editingId === c.id && (
              <div className="mt-4">
                <CategoryForm
                  category={c}
                  saveCategory={saveCategory}
                  onDone={() => setEditingId(null)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
