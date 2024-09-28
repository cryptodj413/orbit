import '/public/fonts/satoshi-variable.css';
import '/public/fonts/gendy.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppProps } from 'next/app';
import Head from 'next/head';
import DefaultLayout from '../layouts/DefaultLayout';
import theme from '../theme';

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DefaultLayout>
          <Component {...pageProps} />
        </DefaultLayout>
      </ThemeProvider>
    </>
  );
}
