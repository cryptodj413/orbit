import { ArrowDownward, ArrowDropDown, ArrowUpward, Star } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import OrbitCDP from 'components/landing/OrbitCDP';
import { LandingLayout } from 'layouts/LandingLayout';
import React from 'react';

export const Desktop = (): JSX.Element => {
  return (
    <LandingLayout>
      <OrbitCDP />
    </LandingLayout>
  );
};

export default Desktop;
