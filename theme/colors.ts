// Core palette inspired by the screenshot (purple–navy–sunset gradient)
export const colors = {
  // Backgrounds
  background: {
    deep: "#05051A",
    card: "rgba(8, 9, 32, 0.96)",
    gradient:
      "radial-gradient(circle at top, #5033FF 0, #1A0F3B 30%, #05051A 70%, #020314 100%)",
  },

  // Text
  text: {
    primary: "#FDF7FF",
    secondary: "#C4B8FF",
  },

  // Highlights
  primary: "#FFB347", // warm sunset orange
  secondary: "#B07CFF", // soft purple accent

  // Component gradients
  paperGradient:
    "linear-gradient(135deg, rgba(255,179,71,0.12), rgba(176,124,255,0.1))",

  buttonGradient:
    "linear-gradient(135deg, #FFB347 0%, #FF6F61 40%, #B07CFF 100%)",

  // Error/Warning colors
  error: {
    main: "#D32F2F", // Material-UI error red
    light: "rgba(211, 47, 47, 0.1)", // Light background for error alerts
    border: "rgba(211, 47, 47, 0.3)", // Border color for error alerts
  },

  // Surface/Item colors
  surface: {
    item: "rgba(255, 255, 255, 0.03)", // Subtle background for list items/cards
  },

  // Common colors
  black: "#000000",

  // Event colors
  events: {
    transfer: "#FFB347", // primary orange for Transfer events
    approval: "#B07CFF", // secondary purple for Approval events
  },
};
