export const docs = [
  {
    slug: "quick-start",
    title: "Quick Start",
    summary: "Install ClientNest on a hosted Supabase project in about 15 minutes.",
  },
  {
    slug: "environment",
    title: "Environment reference",
    summary: "Every variable, whether it is public, and where to get it.",
  },
  {
    slug: "supabase",
    title: "Supabase setup",
    summary: "Project, migrations, Auth URLs, storage buckets, and email.",
  },
  {
    slug: "customization",
    title: "Customization",
    summary: "Harbor tokens, presets, logo, roles, and the optional email adapter.",
  },
  {
    slug: "deployment",
    title: "Deployment",
    summary: "Netlify, Vercel, and self-hosting notes and limits.",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    summary: "Auth, cookies, RLS, files, and production-build failures.",
  },
  {
    slug: "upgrade",
    title: "Upgrade guide",
    summary: "Migration order, backups, and how to apply a newer version.",
  },
] as const;

export type DocSlug = (typeof docs)[number]["slug"];

export function isDocSlug(value: string): value is DocSlug {
  return docs.some((doc) => doc.slug === value);
}
