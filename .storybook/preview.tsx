import type { Preview } from '@storybook/nextjs-vite';
import './storybook.css';
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../src/theme';

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="mobix-story-wrapper">
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],

  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
  },
};

export default preview;
