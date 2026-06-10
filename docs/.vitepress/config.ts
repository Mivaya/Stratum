import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import defineVersionedConfig from "vitepress-versioning-plugin";
import { mainSidebar } from "./sidebar";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readMonorepoVersion(): string {
  const pkgPath = path.resolve(__dirname, "../../package.json");
  return (JSON.parse(readFileSync(pkgPath, "utf-8")) as { version: string }).version;
}

export default defineVersionedConfig(
  {
    title: "Stambha",
    description: "Native Discord bot framework for Node.js and TypeScript",
    base: "/Stambha/",
    cleanUrls: true,
    lastUpdated: true,

    /** Contributor-only — not published to GitHub Pages. */
    srcExclude: ["internal/**", "guide/hosting-the-docs.md", "scripts/**"],

    versioning: {
      latestVersion: readMonorepoVersion(),
      sidebars: {
        processSidebarURLs: true,
      },
    },

    themeConfig: {
      logo: "/logo.svg",
      versionSwitcher: {
        text: "Version",
        includeLatestVersion: true,
      },
      nav: [
        { text: "Guide", link: "/guide/getting-started" },
        { text: "Features", link: "/features/gates" },
        { text: "Deployment", link: "/deployment/overview" },
        { text: "Migration", link: "/migration/" },
        { text: "GitHub", link: "https://github.com/mivaya/Stambha", process: false },
      ],

      sidebar: {
        "/": mainSidebar,
      },

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
  },
  __dirname,
);
