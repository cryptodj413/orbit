import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import React from 'react';

export const SectionFooter = (): JSX.Element => {
  return (
    <Box sx={{ width: '1440px', height: '639px', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          width: '2267px',
          height: '2741px',
          left: '-413px',
        }}
      >
        <Box sx={{ position: 'relative', height: '2741px' }}>
          <Box
            sx={{
              position: 'absolute',
              width: '1440px',
              height: '639px',
              top: 0,
              left: '413px',
              backgroundColor: 'rgba(3, 6, 21, 1)',
              mixBlendMode: 'hard-light',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '2267px',
              height: '2267px',
              top: '474px',
              left: 0,
              backgroundColor: 'rgba(32, 80, 242, 1)',
              borderRadius: '1133.5px',
              filter: 'blur(300px)',
              mixBlendMode: 'hard-light',
              opacity: 0.4,
            }}
          />
          <Grid
            container
            direction="column"
            alignItems="center"
            spacing={4}
            sx={{
              position: 'absolute',
              top: '117px',
              left: '638px',
              width: '991px',
            }}
          >
            <Grid
              item
              container
              direction="column"
              alignItems="center"
              spacing={1}
              sx={{ width: '100%' }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Gendy-Regular, Helvetica',
                  fontSize: '200px',
                  color: 'rgba(193, 200, 227, 1)',
                  textAlign: 'center',
                  letterSpacing: '-8px',
                  lineHeight: '200px',
                }}
              >
                OrbitCDP
              </Typography>
              <Grid item container justifyContent="center" spacing={6} sx={{ width: '495.5px' }}>
                {['Homepage', 'App', 'Docs', 'Blog'].map((text) => (
                  <Grid item key={text}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Satoshi_Variable-Regular, Helvetica',
                        fontSize: '31.5px',
                        color: 'rgba(193, 200, 227, 1)',
                        textAlign: 'center',
                        letterSpacing: '-1.26px',
                        lineHeight: '31.5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {text}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item container justifyContent="center" spacing={2}>
              <Grid item>
                <IconButton>
                  <GitHubIcon sx={{ color: 'rgba(193, 200, 227, 1)', fontSize: '40px' }} />
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton>
                  <TwitterIcon sx={{ color: 'rgba(193, 200, 227, 1)', fontSize: '40px' }} />
                </IconButton>
              </Grid>
              <Grid item>
                {/* <IconButton>
                  <DiscordIcon sx={{ color: 'rgba(193, 200, 227, 1)', fontSize: '40px' }} />
                </IconButton> */}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default SectionFooter;
