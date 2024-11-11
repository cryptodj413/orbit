import { createTheme, ThemeOptions } from '@mui/material/styles';

// Extend the default theme palette to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    brandGuidelines: {
      color: string;
      color10: string;
      color2: string;
      color7: string;
      color8: string;
      color9: string;
      colorDuplicate: string;
      primaryGhostWhite: string;
      primaryMediumBlue: string;
      primaryPeriwinkle: string;
      primaryRichBlack: string;
      secondaryCitrine: string;
      secondaryPlatinum: string;
      secondarySpringBud: string;
      secondaryZaffre: string;
    };
  }
  interface PaletteOptions {
    brandGuidelines: {
      color: string;
      color10: string;
      color2: string;
      color7: string;
      color8: string;
      color9: string;
      colorDuplicate: string;
      primaryGhostWhite: string;
      primaryMediumBlue: string;
      primaryPeriwinkle: string;
      primaryRichBlack: string;
      secondaryCitrine: string;
      secondaryPlatinum: string;
      secondarySpringBud: string;
      secondaryZaffre: string;
    };
  }
}

// Extend typography variants
declare module '@mui/material/styles' {
  interface TypographyVariants {
    small: React.CSSProperties;
    tiny: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    small?: React.CSSProperties;
    tiny?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    small: true;
    tiny: true;
  }
}

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: 'rgba(18, 47, 70, 1)',
    },
    secondary: {
      main: 'rgba(70, 41, 18, 1)',
    },
    brandGuidelines: {
      color: 'rgba(193, 200, 227, 1)',
      color10: 'rgba(32, 80, 242, 1)',
      color2: 'rgba(3, 6, 21, 1)',
      color7: 'rgba(226, 226, 226, 1)',
      color8: 'rgba(150, 253, 2, 1)',
      color9: 'rgba(209, 202, 69, 1)',
      colorDuplicate: 'rgba(193, 200, 227, 1)',
      primaryGhostWhite: 'rgba(250, 251, 255, 1)',
      primaryMediumBlue: 'rgba(2, 21, 211, 1)',
      primaryPeriwinkle: 'rgba(193, 200, 227, 1)',
      primaryRichBlack: 'rgba(3, 6, 21, 1)',
      secondaryCitrine: 'rgba(211, 192, 2, 1)',
      secondaryPlatinum: 'rgba(226, 226, 226, 1)',
      secondarySpringBud: 'rgba(150, 253, 2, 1)',
      secondaryZaffre: 'rgba(2, 17, 169, 1)',
    },
  },
  typography: {
    fontFamily: 'Satoshi Variable, Helvetica',
    h1: {
      fontSize: '61px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    h2: {
      fontSize: '49px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    h3: {
      fontSize: '39px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    h4: {
      fontSize: '31px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    h5: {
      fontSize: '25px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    h6: {
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    body1: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    subtitle1: {
      fontSize: '17px',
      fontWeight: 500,
      lineHeight: '120%',
    },
    small: {
      fontSize: '13px',
      fontWeight: 400,
      lineHeight: '120%',
    },
    tiny: {
      fontSize: '10px',
      fontWeight: 400,
      lineHeight: '120%',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.h2,
        }),
        head: ({ theme }) => ({
          ...theme.typography.subtitle1,
        }),
        body: ({ theme }) => ({
          ...theme.typography.body1,
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: ({ theme }) => ({
          ...theme.typography.h2,
        }),
        secondary: ({ theme }) => ({
          ...theme.typography.body1,
        }),
      },
    },
  },
};

export const appTheme = createTheme(themeOptions);
