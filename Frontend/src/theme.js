import { createTheme } from "@mui/material/styles";

// Palette: refined purple-red (plum) accent on a soft grey base. No blue.
const colors = {
  cream: "#F5F3F6", // app background (soft cool grey)
  charcoal: "#2B2530", // primary text / dark surfaces (near-black plum-grey)
  terracotta: "#A64C6E", // secondary accent (rose-plum)
  plum: "#6E2A4E", // primary accent (deep purple-red)
  plumDark: "#551F3C",
  plumSoft: "#EFDFEA", // light plum tint (selected / chips)
  white: "#FFFFFF",
  text: "#2B2530",
  secondaryText: "#6E6672",
  border: "#E4DFE6",
  subtle: "#EDE8EF",
  success: "#4F6B57",
  successBg: "#E9F0E9",
  warning: "#9A6B34",
  warningBg: "#F6EFE2",
  danger: "#B23A48",
  dangerBg: "#F8ECEE"
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.plum,
      dark: colors.plumDark,
      light: colors.terracotta,
      contrastText: colors.white
    },
    secondary: {
      main: colors.terracotta
    },
    background: {
      default: colors.cream,
      paper: colors.white
    },
    text: {
      primary: colors.text,
      secondary: colors.secondaryText
    },
    divider: colors.border,
    success: {
      main: colors.success
    },
    warning: {
      main: colors.warning
    },
    error: {
      main: colors.danger
    }
  },

  typography: {
    fontFamily: '"Manrope", sans-serif',
    h1: {
      fontSize: "2.1rem",
      fontWeight: 700,
      letterSpacing: "-0.055em",
      lineHeight: 1.2
    },
    h2: {
      fontSize: "1.65rem",
      fontWeight: 700,
      letterSpacing: "-0.04em"
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 700,
      letterSpacing: "-0.025em"
    },
    h4: {
      fontSize: "1.1rem",
      fontWeight: 700
    },
    body1: {
      fontSize: "0.94rem",
      lineHeight: 1.7
    },
    body2: {
      fontSize: "0.84rem",
      lineHeight: 1.65
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.86rem",
      letterSpacing: "0.01em"
    }
  },

  shape: {
    borderRadius: 12
  },

  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 10,
          padding: "10px 18px",
          transition: "background-color .18s ease, box-shadow .18s ease, transform .18s ease",
          "&:active": { transform: "translateY(1px)" }
        },
        containedPrimary: {
          boxShadow: "0 6px 16px rgba(110, 42, 78, 0.22)",
          "&:hover": {
            boxShadow: "0 8px 22px rgba(110, 42, 78, 0.28)"
          }
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        },
        rounded: {
          borderRadius: 14
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.border}`,
          boxShadow:
            "0 1px 2px rgba(43, 37, 48, 0.04), 0 8px 24px rgba(43, 37, 48, 0.05)",
          borderRadius: 14,
          transition: "box-shadow .2s ease, border-color .2s ease, transform .2s ease",
          "&:hover": {
            borderColor: "#D8CFDD",
            boxShadow:
              "0 2px 4px rgba(43, 37, 48, 0.05), 0 14px 34px rgba(43, 37, 48, 0.08)"
          }
        }
      }
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.white,
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.border
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#C9BCCB"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.plum,
            borderWidth: 1.5
          }
        },
        input: {
          padding: "12px 14px"
        }
      }
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border}`,
          padding: "14px 16px"
        },
        head: {
          color: colors.secondaryText,
          fontWeight: 600,
          fontSize: "0.76rem",
          letterSpacing: "0.02em",
          backgroundColor: colors.cream
        }
      }
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.73rem"
        },
        outlined: {
          borderColor: colors.border
        }
      }
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600
        }
      }
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(43, 37, 48, 0.16)"
        }
      }
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.charcoal,
          fontWeight: 600
        }
      }
    }
  }
});

export { colors };
export default theme;
