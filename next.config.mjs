/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Keep compression sane: Next.js default quality (75) is fine — do NOT
    // lower this aggressively. Sharpness is preserved via correct `sizes`
    // on every <Image> and by never upscaling small sources beyond their
    // native resolution (see components/ImageWithFallback.tsx).
    remotePatterns: [
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "images.openai.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
