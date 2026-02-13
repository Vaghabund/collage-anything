import { createTheme } from '@mui/material/styles';

const theme = createTheme(
    {
      palette: {
        mode: 'dark',
        primary: {
          light: "#90caf9",
          main: "#42a5f5",
          dark: "#1976d2",
          contrastText: "#ffffff",
        },
        secondary: {
          light: "#ba68c8",
          main: "#9c27b0",
          dark: "#7b1fa2",
          contrastText: "#ffffff",
        },
        background: {
          default: "#121212",
          paper: "#1e1e1e",
        },
        text: {
          primary: "#ffffff",
          secondary: "#b0b0b0",
        }
      },
      typography: {
        useNextVariants: true,
      }
    }
);

export default theme;