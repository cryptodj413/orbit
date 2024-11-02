import '/public/fonts/satoshi-variable.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { SettingsProvider } from '../contexts';
import { WalletProvider } from '../contexts/wallet';
import DefaultLayout from '../layouts/DefaultLayout';
import theme from '../theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MySorobanReactProvider from '../soroban/MySorobanReactProvider';
import Providers from '../components/Providers/Providers';

const queryClient = new QueryClient();

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <WalletProvider>
              <CssBaseline />
              <Providers>
                <Component {...pageProps} />
              </Providers>
            </WalletProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
