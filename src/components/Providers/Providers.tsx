import { ColorModeContext } from '../../contexts';
import { Provider } from 'react-redux';
import { useMemo, useState } from 'react';
import MySorobanReactProvider from '../../soroban/MySorobanReactProvider';
import store from '../../state';
import { SorobanContextType } from '@soroban-react/core';
import ContextProvider from './ContextProvider';
import InkathonProvider from '../../inkathon/InkathonProvider';
import { WalletProvider } from '../../contexts/wallet';

export default function Providers({
  children,
  sorobanReactProviderProps,
}: {
  children: React.ReactNode;
  sorobanReactProviderProps?: Partial<SorobanContextType>;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  return (
    <Provider store={store}>
      <InkathonProvider>
        <ColorModeContext.Provider value={colorMode}>
          <MySorobanReactProvider {...sorobanReactProviderProps}>
            <WalletProvider>
              <ContextProvider>{children}</ContextProvider>
            </WalletProvider>
          </MySorobanReactProvider>
        </ColorModeContext.Provider>
      </InkathonProvider>
    </Provider>
  );
}
