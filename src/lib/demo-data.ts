/** Neutral demo story for Week 1 mockups. No real people or clients. */

export const agency = {
  name: "Harbor Studio",
  owner: "Sam Reed",
};

export const client = {
  company: "Pine & Oak Coffee",
  contact: "Alex Marin",
};

export const project = {
  name: "Seasonal menu site",
  status: "In progress",
  due: "18 Sep 2026",
  summary:
    "A branded ordering page for the autumn menu, plus a client-facing place to review layouts before print.",
};

export const stats = [
  { label: "Active projects", value: "8" },
  { label: "Awaiting approval", value: "3" },
  { label: "Files shared this week", value: "21" },
  { label: "Open invoices", value: "2" },
];

export const projects = [
  {
    name: "Seasonal menu site",
    client: "Pine & Oak Coffee",
    status: "Awaiting approval",
    due: "18 Sep",
    href: "/mockups/project",
  },
  {
    name: "Brand refresh",
    client: "North Shore Dental",
    status: "In progress",
    due: "2 Oct",
    href: "/mockups/project",
  },
  {
    name: "Launch landing page",
    client: "Fieldnote Journal",
    status: "Approved",
    due: "12 Aug",
    href: "/mockups/project",
  },
];

export const activity = [
  {
    text: "Alex Marin requested changes on Homepage hero v3",
    time: "2 hours ago",
  },
  {
    text: "Riley Chen uploaded Menu board.pdf",
    time: "Yesterday",
  },
  {
    text: "Invoice INV-1042 marked as sent",
    time: "Yesterday",
  },
  {
    text: "Milestone “Content freeze” completed",
    time: "3 days ago",
  },
];

export const milestones = [
  { name: "Kickoff & sitemap", status: "Done", due: "4 Aug" },
  { name: "Homepage & menu board", status: "In review", due: "18 Sep" },
  { name: "Ordering flow", status: "Up next", due: "2 Oct" },
];

export const tasks = [
  { name: "Revise hero headline", owner: "Riley Chen", status: "In progress" },
  { name: "Export print PDF", owner: "Jordan Hale", status: "Todo" },
  { name: "Confirm allergen copy", owner: "Alex Marin", status: "Waiting on client" },
];

export const files = [
  { name: "Homepage-hero-v3.png", meta: "Shared with client · 1.8 MB" },
  { name: "Menu-board.pdf", meta: "Team only · 420 KB" },
  { name: "Brand-tokens.txt", meta: "Shared with client · 12 KB" },
];

export const comments = [
  {
    author: "Riley Chen",
    role: "Design",
    time: "Yesterday",
    body: "Hero now uses the autumn palette. Headline is still a placeholder pending their tasting notes.",
  },
  {
    author: "Alex Marin",
    role: "Client",
    time: "2 hours ago",
    body: "Please swap the pastry photo for the new croissant shot, and make the allergen line larger.",
  },
];
