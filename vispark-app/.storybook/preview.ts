import type { Preview } from "@storybook/react-vite";
import "../src/index.css";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import { background } from "storybook/theming";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#0f172a",
        },
        {
          name: "light",
          value: "#ffffff",
        },
      ],
    },
    viewport: {
      viewports: INITIAL_VIEWPORTS,
    },
    layout: "centered",
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    docs: {
      toc: true,
    },
  },
  initialGlobals: {
    backgrounds: { value: "dark" },
    viewport: { value: 'mobile2', isRotated: false },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        // The label to show for this toolbar item
        title: 'Theme',
        icon: 'circlehollow',
        // Array of plain string values or MenuItem shape (see below)
        items: ['light', 'dark'],
        // Change title based on selected value
        dynamicTitle: true,
      },
    }
  },
};

export default preview;
