import React from 'react';

import { Box, styled, useTheme } from '@mui/material';

const ContentWrapper = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  min-height: 100px;
  min-width: 200px;

  border: 1px solid transparent;

  display: flex;
  padding: 32px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;

  border-radius: 16px;
  box-shadow: 0px 4px 10px 0px rgba(136, 102, 221, 0.1);
`;

export default function ModalBox({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return <ContentWrapper>{children}</ContentWrapper>;
}
