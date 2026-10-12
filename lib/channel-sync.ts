/**
 * ═══════════════════════════════════════════════════════════════════════
 *  WHATSAPP CHANNEL SYNC — plug-in adapter
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  WhatsApp Channels have NO official public API for reading channel posts.
 *  Until WhatsApp/Meta ships one, automated channel -> site sync is NOT
 *  possible, so mh_updates rows are created manually (source = 'manual')
 *  via the future /admin area.
 *
 *  HARD RULE: no scraping, no unofficial endpoints, no third-party
 *  "WhatsApp API" workarounds may be added here or anywhere in this file.
 *  When an official read API exists, implement a new class extending
 *  ChannelSyncProvider (e.g. OfficialChannelProvider) and swap the
 *  provider returned by getChannelSyncProvider(). Nothing else changes.
 * ═══════════════════════════════════════════════════════════════════════
 */

export interface ChannelPost {
  externalId: string;
  title: string | null;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  publishedAt: string | null;
}

export interface ChannelSyncProvider {
  /** Human-readable provider name, e.g. "manual". */
  readonly name: string;
  /** True only when automatic channel sync is actually configured. */
  isConfigured(): boolean;
  /** Honest, user-safe status string shown in the UI / admin. */
  getStatusMessage(): string;
  /**
   * Fetch posts from the channel. ManualProvider returns [] because there
   * is no channel connection — manual rows live in mh_updates already.
   */
  fetchPosts(): Promise<ChannelPost[]>;
}

interface DbLike {
  from(table: string): {
    select(cols: string): {
      eq(col: string, val: unknown): Promise<{ data: unknown[] | null; error: unknown }>;
    };
  };
}

/**
 * Manual provider: updates are entered by hand (source='manual').
 * Auto-sync is NOT configured — there is no official WhatsApp Channels API.
 */
export class ManualProvider implements ChannelSyncProvider {
  readonly name = "manual";

  constructor(private db: DbLike) {}

  isConfigured(): boolean {
    return false;
  }

  getStatusMessage(): string {
    return "Channel sync is not available — WhatsApp Channels have no official read API. Updates are added manually.";
  }

  async fetchPosts(): Promise<ChannelPost[]> {
    const { data } = await this.db.from("mh_updates").select("*").eq("source", "manual");
    return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
      externalId: String(row.source_external_id ?? row.id ?? ""),
      title: (row.title as string | null) ?? null,
      body: String(row.body ?? ""),
      imageUrl: (row.image_url as string | null) ?? null,
      linkUrl: (row.link_url as string | null) ?? null,
      publishedAt: (row.published_at as string | null) ?? null,
    }));
  }
}

/** Resolve the active provider. Swap the return value when an official API exists. */
export function getChannelSyncProvider(db: DbLike): ChannelSyncProvider {
  return new ManualProvider(db);
}
