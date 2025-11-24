"use client";

import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    background: {
      default: colors.background.deep,
      paper: colors.background.card,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    error: {
      main: colors.error.main,
    },
  },

  typography: {
    fontFamily:
      '"Space Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    h1: {
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    },
    h2: {
      fontWeight: 500,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
    },
    h3: {
      fontWeight: 500,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: colors.background.gradient,
          color: colors.text.primary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: colors.paperGradient,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          backdropFilter: "blur(22px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          letterSpacing: "0.06em",
          paddingInline: "1.5rem",
          paddingBlock: "0.6rem",
          backgroundImage: colors.buttonGradient,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          "&:hover": {
            boxShadow: "0 10px 30px rgba(0,0,0,0.85)",
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s ease-out",
        },
      },
    },
  },
});
