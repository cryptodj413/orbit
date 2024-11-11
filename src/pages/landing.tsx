import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StarIcon from '@mui/icons-material/Star'; // Placeholder for missing icons
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import SectionFooter from 'components/landing/Footer';
import { LandingLayout } from 'layouts/LandingLayout';
import React from 'react';

export const Desktop = (): JSX.Element => {
  return (
    <LandingLayout>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          <Container sx={{ pt: 4 }}>
            <AppBar position="static" sx={{ bgcolor: 'rgba(3, 6, 21, 1)', borderRadius: 2, p: 1 }}>
              <Toolbar>
                <DashboardIcon sx={{ color: 'white', mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Link href="#" color="inherit" sx={{ mx: 2 }}>
                    About
                  </Link>
                  <Link href="#" color="inherit" sx={{ mx: 2 }}>
                    Features
                  </Link>
                  <Link href="#" color="inherit" sx={{ mx: 2 }}>
                    Security
                  </Link>
                  <Link href="#" color="inherit" sx={{ mx: 2 }}>
                    Community
                  </Link>
                </Box>
                <Button
                  variant="contained"
                  sx={{ bgcolor: 'rgba(150, 253, 2, 1)', color: 'black' }}
                >
                  Launch App
                </Button>
              </Toolbar>
            </AppBar>
          </Container>

          <Container sx={{ mt: 8 }}>
            <Typography variant="h1" align="center" color="white">
              Get your finances in
            </Typography>
            <Typography variant="h1" align="center" color="rgba(29, 66, 255, 1)">
              Orbit
            </Typography>
            <Typography variant="subtitle1" align="center" color="white" sx={{ mt: 2 }}>
              Harness the Power of Collateralized Debt Positions for Secure and Reliable Stablecoins
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body1" color="rgba(171, 171, 171, 1)">
                Learn more
              </Typography>
              <ArrowDownwardIcon sx={{ color: 'rgba(171, 171, 171, 1)' }} />
            </Box>
          </Container>

          <Container sx={{ mt: 8 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    bgcolor: 'rgba(3, 6, 21, 1)',
                    borderRadius: 4,
                    p: 2,
                    position: 'relative',
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" color="white">
                      Total Value Locked
                    </Typography>
                    <Typography variant="h2" color="white">
                      $350.240
                    </Typography>
                    <Typography variant="body2" color="rgba(32, 80, 242, 1)">
                      +21.77
                    </Typography>
                  </CardContent>
                  <CardMedia
                    component="img"
                    image="/button.svg"
                    alt="Button"
                    sx={{
                      width: 50,
                      height: 50,
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                    }}
                  />
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    bgcolor: 'rgba(3, 6, 21, 1)',
                    borderRadius: 4,
                    p: 2,
                    position: 'relative',
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" color="white">
                      Total Debt
                    </Typography>
                    <Typography variant="h2" color="white">
                      $245.015
                    </Typography>
                    <Typography variant="body2" color="rgba(238, 31, 31, 1)">
                      -0.14
                    </Typography>
                  </CardContent>
                  <CardMedia
                    component="img"
                    image="/button-2.svg"
                    alt="Button"
                    sx={{
                      width: 50,
                      height: 50,
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                    }}
                  />
                </Card>
              </Grid>
            </Grid>
          </Container>

          <Container sx={{ mt: 8 }}>
            <Card sx={{ bgcolor: 'rgba(3, 6, 21, 1)', borderRadius: 4, p: 2 }}>
              <CardContent>
                <Typography variant="h5" color="white">
                  Transaction Volume
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2" color="white">
                    Daily
                  </Typography>
                  <Typography variant="body2" color="white">
                    Weekly
                  </Typography>
                  <Typography variant="body2" color="white">
                    Monthly
                  </Typography>
                  <Typography variant="body2" color="white">
                    Yearly
                  </Typography>
                </Box>
                <CardMedia component="img" image="/graph-bg.svg" alt="Graph" sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Container>

          <Container sx={{ mt: 8 }}>
            <Card sx={{ bgcolor: 'rgba(3, 6, 21, 1)', borderRadius: 4, p: 2 }}>
              <CardContent>
                <Typography variant="h5" color="white">
                  User Activity
                </Typography>
                <Typography variant="h2" color="white">
                  90,293
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box
                    sx={{
                      bgcolor: 'rgba(209, 202, 69, 1)',
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    <StarIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box
                    sx={{
                      bgcolor: 'rgba(150, 253, 2, 1)',
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    <StarIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box
                    sx={{
                      bgcolor: 'rgba(32, 80, 242, 1)',
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    <StarIcon sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>

          <Container sx={{ mt: 8 }}>
            <Card sx={{ bgcolor: 'rgba(3, 6, 21, 1)', borderRadius: 4, p: 2 }}>
              <CardContent>
                <Typography variant="h5" color="white">
                  Borrow APY
                </Typography>
                <Typography variant="h2" color="white">
                  4.0%
                </Typography>
              </CardContent>
            </Card>
          </Container>

          <Container sx={{ mt: 8 }}>
            <Card sx={{ bgcolor: 'rgba(3, 6, 21, 1)', borderRadius: 4, p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="white">
                  Getting started is easy.
                </Typography>
                <Typography variant="body1" color="rgba(193, 200, 227, 1)" sx={{ mt: 2 }}>
                  Start creating and managing your stablecoins now or explore our comprehensive
                  guides and resources.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: 'rgba(32, 80, 242, 1)', color: 'white' }}
                  >
                    Open your dashboard
                    <ArrowForwardIcon sx={{ ml: 1 }} />
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ bgcolor: 'rgba(193, 200, 227, 1)', color: 'black' }}
                  >
                    Read the Docs
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Container>

          <Container sx={{ mt: 8 }}>
            <Card sx={{ bgcolor: 'rgba(3, 6, 21, 1)', borderRadius: 4, p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="white">
                  Frequently Asked Questions
                </Typography>
                <List>
                  <ListItem button>
                    <ListItemText primary="What is OrbitCDP?" />
                    <ArrowDropDownIcon />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="What is a Collateralized Debt Position (CDP) and how does it differ from fiat-backed and algorithmic stablecoins?" />
                    <ArrowDropDownIcon />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="What is Blend and why do we use it?" />
                    <ArrowDropDownIcon />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="What is your plan for the DAO?" />
                    <ArrowDropDownIcon />
                  </ListItem>
                  <ListItem button>
                    <ListItemText primary="How does OrbitCDP support cross-border transactions and what are the benefits?" />
                    <ArrowDropDownIcon />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Container>

          <SectionFooter />
        </Box>
      </Box>
    </LandingLayout>
  );
};

export default Desktop;
