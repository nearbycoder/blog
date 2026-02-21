import React from "react";

const COLORS = {
  canvas: "#080a0f",
  panel: "#0e121b",
  panelEdge: "rgba(255,255,255,0.14)",
  copy: "#f2f1ec",
  muted: "#d7d5ce",
  fog: "#9fa4ad",
};

const SECTION_THEME = {
  article: {
    eyebrow: "Article",
    accentA: "rgba(111, 209, 215, 0.45)",
    accentB: "rgba(56, 189, 248, 0.3)",
  },
  project: {
    eyebrow: "Project",
    accentA: "rgba(245, 181, 74, 0.45)",
    accentB: "rgba(251, 146, 60, 0.28)",
  },
  layoff: {
    eyebrow: "Layoff Log",
    accentA: "rgba(233, 161, 168, 0.42)",
    accentB: "rgba(251, 113, 133, 0.3)",
  },
  page: {
    eyebrow: "Nearbycoder",
    accentA: "rgba(111, 209, 215, 0.42)",
    accentB: "rgba(245, 181, 74, 0.3)",
  },
};

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) {
    return value ?? "";
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function normalizePathname(pathname) {
  if (!pathname) return "/";
  if (pathname.startsWith("/")) return pathname;
  return `/${pathname}`;
}

function getTheme(pathname) {
  if (pathname.startsWith("/articles/")) return SECTION_THEME.article;
  if (pathname.startsWith("/projects/")) return SECTION_THEME.project;
  if (pathname.startsWith("/layoff/")) return SECTION_THEME.layoff;
  return SECTION_THEME.page;
}

function getUrlLabel(pathname) {
  if (pathname === "/") return "nearbycoder.com";
  return truncate(`nearbycoder.com${pathname.replace(/\/$/, "")}`, 52);
}

function getDisplayTitle(rawTitle, pathname) {
  if (pathname === "/") {
    return "Josh Hamilton / Nearbycoder";
  }

  const base = rawTitle.split(" · ")[0].trim();
  return truncate(base || rawTitle, 72);
}

function getTitleSize(displayTitle) {
  if (displayTitle.length <= 32) return 74;
  if (displayTitle.length <= 52) return 64;
  if (displayTitle.length <= 64) return 56;
  return 50;
}

export async function renderNearbycoderOg({ title, description, pathname }) {
  const normalizedPath = normalizePathname(pathname);
  const theme = getTheme(normalizedPath);
  const safeTitle = getDisplayTitle(title, normalizedPath);
  const safeDescription = truncate(description ?? "", 130);
  const urlLabel = getUrlLabel(normalizedPath);
  const titleSize = getTitleSize(safeTitle);
  const h = React.createElement;

  return h("div", {
    style: {
      height: "100%",
      width: "100%",
      display: "flex",
      position: "relative",
      backgroundColor: COLORS.canvas,
      color: COLORS.copy,
      fontFamily: "Space Grotesk",
      overflow: "hidden",
    },
    children: [
      h("div", {
        key: "noise-one",
        style: {
          position: "absolute",
          top: -220,
          left: -180,
          width: 620,
          height: 620,
          borderRadius: 9999,
          backgroundColor: theme.accentA,
        },
      }),
      h("div", {
        key: "noise-two",
        style: {
          position: "absolute",
          top: -160,
          right: -220,
          width: 640,
          height: 640,
          borderRadius: 9999,
          backgroundColor: theme.accentB,
        },
      }),
      h("div", {
        key: "noise-three",
        style: {
          position: "absolute",
          bottom: -240,
          right: 260,
          width: 520,
          height: 520,
          borderRadius: 9999,
          backgroundColor: "rgba(255,255,255,0.08)",
        },
      }),
      h("div", {
        key: "panel",
        style: {
          position: "absolute",
          top: 46,
          right: 46,
          bottom: 46,
          left: 46,
          borderRadius: 40,
          border: `2px solid ${COLORS.panelEdge}`,
          backgroundColor: COLORS.panel,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 64px",
        },
        children: [
          h("div", {
            key: "meta",
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            },
            children: [
              h("div", {
                key: "eyebrow",
                style: {
                  fontSize: 19,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                  color: COLORS.muted,
                  fontWeight: 700,
                },
                children: theme.eyebrow,
              }),
              h("div", {
                key: "url",
                style: {
                  fontSize: 18,
                  color: COLORS.fog,
                  fontWeight: 500,
                },
                children: urlLabel,
              }),
            ],
          }),
          h("div", {
            key: "main-copy",
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 26,
              marginTop: 18,
            },
            children: [
              h("div", {
                key: "title",
                style: {
                  fontSize: titleSize,
                  lineHeight: 1.05,
                  fontWeight: 700,
                  color: "#ffffff",
                  maxWidth: "100%",
                },
                children: safeTitle,
              }),
              h("div", {
                key: "description",
                style: {
                  fontSize: 31,
                  lineHeight: 1.22,
                  color: COLORS.muted,
                  maxWidth: "94%",
                },
                children:
                  safeDescription ||
                  "Staff software engineering insights on resilient systems, shipping calmly, and practical leadership.",
              }),
            ],
          }),
          h("div", {
            key: "footer",
            style: {
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${COLORS.panelEdge}`,
              paddingTop: 20,
              color: COLORS.fog,
              fontSize: 19,
              letterSpacing: 1,
            },
            children: [
              h("div", {
                key: "brand",
                style: {
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  fontWeight: 500,
                },
                children: [
                  h("span", {
                    key: "name",
                    style: {
                      color: "#ffffff",
                      fontFamily: "Instrument Serif",
                      fontSize: 29,
                    },
                    children: "Josh Hamilton",
                  }),
                  h("span", {
                    key: "dot",
                    children: "•",
                  }),
                  h("span", {
                    key: "handle",
                    children: "@nearbycoder",
                  }),
                ],
              }),
              h("div", {
                key: "role",
                children: "Staff Software Engineer · Tulsa, Oklahoma",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
