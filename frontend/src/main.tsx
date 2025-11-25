import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import App from './App.tsx'

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
});

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>,
)
