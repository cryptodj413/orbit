import { useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import DefaultLayout from '../layouts/DefaultLayout';
import { SettingsProvider, WalletProvider } from '../contexts';
import theme from '../theme';
import '../globals.css';

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <SettingsProvider>
              <WalletProvider>
                <CssBaseline />
                <DefaultLayout>
                  <Component {...pageProps} />
                </DefaultLayout>
              </WalletProvider>
            </SettingsProvider>
          </ThemeProvider>
        </QueryClientProvider>
    </>
  );
}
