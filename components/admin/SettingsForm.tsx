"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveSettings, type ActionState } from "@/lib/admin/actions";
import { SETTING_FIELDS } from "@/lib/admin/setting-fields";

const inputCls =
  "w-full rounded-xl border border-espresso/20 bg-white px-4 py-2.5 text-espresso placeholder:text-espresso/30";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-espresso text-ivory font-medium px-6 py-2.5 hover:bg-espresso/90 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [state, formAction] = useFormState<ActionState, FormData>(saveSettings, {
    ok: true,
  });

  return (
    <form action={formAction} className="space-y-8">
      <div className="rounded-2xl bg-white border border-espresso/10 p-5 sm:p-6 space-y-5">
        {SETTING_FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={field.key}
              className="block text-sm font-medium text-espresso mb-1"
            >
              {field.label}
            </label>
            {"hint" in field && field.hint && (
              <p className="text-xs text-espresso/50 mb-1.5">{field.hint}</p>
            )}
            {field.type === "textarea" ? (
              <textarea
                id={field.key}
                name={field.key}
                rows={3}
                defaultValue={initial[field.key] ?? ""}
                className={inputCls}
              />
            ) : (
              <input
                id={field.key}
                name={field.key}
                type="text"
                defaultValue={initial[field.key] ?? ""}
                className={inputCls}
              />
            )}
            {state.errors?.[field.key] && (
              <p className="text-xs text-red-700 mt-1">{state.errors[field.key]}</p>
            )}
          </div>
        ))}
        <SubmitButton />
      </div>

      {/* Honest channel-sync status (read-only) */}
      <div className="rounded-2xl bg-white border border-espresso/10 p-5 sm:p-6">
        <h2 className="font-medium text-espresso mb-3">WhatsApp channel sync</h2>
        <div className="space-y-3 text-sm text-espresso/75">
          <p>
            <span className="font-semibold text-espresso">
              (a) Manual publishing works now:
            </span>{" "}
            anything you write on the Updates page appears on the public site
            immediately.
          </p>
          <p>
            <span className="font-semibold text-espresso">
              (b) No automatic sync:
            </span>{" "}
            Meta provides no official API for reading WhatsApp Channel posts, so
            posts on the channel cannot be pulled in automatically. This has been
            verified by research and is not something to work around.
          </p>
          <p>
            <span className="font-semibold text-espresso">
              (c) Follow button:
            </span>{" "}
            paste the channel URL in the field above to enable the
            “Follow us on WhatsApp” button on the site.
          </p>
          <p>
            <span className="font-semibold text-espresso">
              (d) Future plug-in point:
            </span>{" "}
            if Meta ever ships an official channel API, the{" "}
            <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">
              lib/channel-sync.ts
            </code>{" "}
            adapter is where it gets implemented — nothing else needs to change.
          </p>
          <div className="rounded-xl bg-ivory border border-espresso/10 p-3">
            <p className="text-xs uppercase tracking-wider text-espresso/50 mb-1">
              Current sync status
            </p>
            <p>{initial.channel_sync_status || "Manual publishing — no automatic sync."}</p>
          </div>
        </div>
      </div>
    </form>
  );
}
