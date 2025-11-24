import { Box } from "@mui/material";
import { colors } from "@/theme/colors";

type AnimatedTextProps = {
  text: string;
};

/**
 * Component that displays text with animated dots (...)
 */
export function AnimatedText({ text }: AnimatedTextProps) {
  return (
    <Box
      component="span"
      sx={{
        color: colors.black,
        fontSize: "inherit",
        lineHeight: "inherit",
        "&::after": {
          content: '"..."',
          display: "inline-block",
          width: "1.2em",
          textAlign: "left",
          animation: "dots 1.5s steps(4, end) infinite",
          "@keyframes dots": {
            "0%, 20%": { content: '"."' },
            "40%": { content: '".."' },
            "60%, 100%": { content: '"..."' },
          },
        },
      }}
    >
      {text}
    </Box>
  );
}
