# Third-party notices

ClientNest ships other people’s packages. They keep their own licenses. Runtime and fonts a buyer redistributes with an end product:

| Package / font                           | License | Notes                                             |
| ---------------------------------------- | ------- | ------------------------------------------------- |
| Next.js                                  | MIT     | `next`                                            |
| React / React DOM                        | MIT     |                                                   |
| Tailwind CSS                             | MIT     |                                                   |
| `@supabase/supabase-js`, `@supabase/ssr` | MIT     | Do not copy service-role keys into client bundles |
| zod                                      | MIT     |                                                   |
| lucide-react                             | ISC     | Icons                                             |
| IBM Plex Sans / Mono                     | SIL OFL | `next/font` Google distribution                   |
| Source Serif 4                           | SIL OFL | Letterhead / H1 only                              |

Dev tools (Vitest, Playwright, ESLint, Prettier, TypeScript, Supabase CLI) are listed in `package.json` `devDependencies` and are not required at runtime.

There are **no** paid stock photos, paid icon sets, or paid fonts. If you add any, you must have redistribution rights before you put them in a client ZIP.
