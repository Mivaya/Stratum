import type { DefaultTheme } from "vitepress";

/** Shared sidebar for latest docs and archived version snapshots. */
export const mainSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: "Introduction",
    items: [
      { text: "Why Stambha", link: "/guide/why-stambha" },
      { text: "Getting started", link: "/guide/getting-started" },
      { text: "Project structure", link: "/guide/project-structure" },
      { text: "Pieces & pipeline", link: "/guide/pieces" },
    ],
  },
  {
    text: "Features",
    items: [
      { text: "Gates", link: "/features/gates" },
      { text: "Arguments", link: "/features/args" },
      { text: "Command tree", link: "/features/command-tree" },
      { text: "Plugins", link: "/features/plugins" },
      { text: "Vault", link: "/features/vault" },
      { text: "Sequences", link: "/features/sequences" },
      { text: "Chron", link: "/features/chron" },
      { text: "Desired properties", link: "/features/desired-properties" },
    ],
  },
  {
    text: "Deployment",
    items: [
      { text: "Overview", link: "/deployment/overview" },
      { text: "Tier split", link: "/deployment/tier-split" },
      { text: "Native REST", link: "/deployment/native-rest" },
      { text: "Gateway", link: "/deployment/gateway" },
      { text: "Resharding", link: "/deployment/resharding" },
      { text: "Metrics", link: "/deployment/metrics" },
      { text: "Cross-runtime", link: "/deployment/cross-runtime" },
    ],
  },
  {
    text: "Reference",
    items: [{ text: "Transport", link: "/reference/transport" }],
  },
  {
    text: "Migration",
    items: [
      { text: "Overview", link: "/migration/" },
      { text: "Piece-based framework", link: "/migration/from-sapphire" },
      { text: "Native transport stack", link: "/migration/from-discordeno" },
    ],
  },
];
