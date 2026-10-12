/** Field definitions for the owner settings page (plain module — safe to import anywhere). */
export const SETTING_FIELDS = [
  { key: "brand_name", label: "Brand name", type: "text" },
  { key: "contact_email", label: "Contact email", type: "text" },
  { key: "whatsapp_display", label: "WhatsApp display number", type: "text" },
  {
    key: "whatsapp_number",
    label: "WhatsApp number (digits only, e.g. 2347018733485)",
    type: "text",
  },
  {
    key: "whatsapp_channel_url",
    label: "WhatsApp Channel URL (provide later)",
    type: "text",
    hint: "Paste the channel link here once it is provided. It powers the “Follow us on WhatsApp” button on the site.",
  },
  { key: "telegram_url", label: "Telegram URL", type: "text" },
  { key: "delivery_notice", label: "Delivery notice", type: "textarea" },
  { key: "referral_notice", label: "Referral notice", type: "textarea" },
] as const;
