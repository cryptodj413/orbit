import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProps } from 'next/app';
import Head from 'next/head';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import DefaultLayout from '../layouts/DefaultLayout';
import '../globals.css';
import { SettingsProvider } from '../contexts';
import { WalletProvider } from '../contexts/wallet';
import { StatusProvider } from '../contexts/status';

const queryClient = new QueryClient();

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
                  <StatusProvider>
                    <DefaultLayout>
                      <Component {...pageProps} />
                    </DefaultLayout>
                  </StatusProvider>
              </WalletProvider>
            </SettingsProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
