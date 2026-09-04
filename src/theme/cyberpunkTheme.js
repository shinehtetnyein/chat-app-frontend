import { createTheme } from '@mui/material/styles';

export const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#07070c',
      paper: '#100f1d',
    },
    primary: {
      main: '#00f0ff', // Electric Cyan
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff007f', // Neon Pink
      contrastText: '#ffffff',
    },
    success: {
      main: '#00ff66', // Matrix Green
    },
    warning: {
      main: '#ffe600', // Cyber Yellow
    },
    info: {
      main: '#7000ff', // Neon Purple
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto Mono", "Courier New", sans-serif',
    h5: { fontWeight: 700, letterSpacing: '0.05em' },
    h6: { fontWeight: 600, letterSpacing: '0.03em' },
    button: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(45deg, #00f0ff 0%, #00a8ff 100%)',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.8)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #ff007f 0%, #d0006f 100%)',
          boxShadow: '0 0 10px rgba(ff, 0, 127, 0.5)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(ff, 0, 127, 0.8)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(16, 15, 29, 0.7)',
            '& fieldset': {
              borderColor: 'rgba(0, 240, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: '#00f0ff',
              boxShadow: '0 0 8px rgba(0, 240, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f0ff',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.6)',
            },
          },
        },
      },
    },
  },
});
