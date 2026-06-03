import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Stambha",
  description: "Native Discord bot framework for Node.js and TypeScript",
  base: "/Stambha/",
  cleanUrls: true,
  lastUpdated: true,

  /** Contributor-only — not published to GitHub Pages. */
  srcExclude: ["internal/**", "guide/hosting-the-docs.md"],

  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Features", link: "/features/gates" },
      { text: "Deployment", link: "/deployment/overview" },
      { text: "Migration", link: "/migration/" },
      { text: "GitHub", link: "https://github.com/mivaya/Stambha" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
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
          { text: "From Sapphire", link: "/migration/from-sapphire" },
          { text: "From Discordeno", link: "/migration/from-discordeno" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/mivaya/Stambha" }],

    editLink: {
      pattern: "https://github.com/mivaya/Stambha/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © Stambha contributors",
    },

    search: {
      provider: "local",
    },
  },

  ignoreDeadLinks: true,
});
