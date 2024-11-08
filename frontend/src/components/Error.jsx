import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

const NotFoundPage = () => {
  return (
    <Box sx={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#e0e2f4', fontFamily: 'VT323, monospace' }}>
      
      {/* Navbar with Home button */}
      <Box sx={{ position: 'absolute', top: '10px', textAlign: 'center', width: '100%' }}>
        <Button href="/" variant="text" sx={{ color: '#e0e2f4', fontWeight: 'bold', fontSize: '1.25rem', '&:hover': { color: '#0414a7' } }}>
          Home
        </Button>
      </Box>

      <Container sx={{ textAlign: 'center' }}>
        {/* Error Title */}
        <Typography variant="h1" sx={{ fontSize: '2.75rem', marginBottom: '20px', color: '#aaaaaa', backgroundColor: '#0414a7', display: 'inline-block', px: 2 }}>
          Error - 404
        </Typography>

        

        {/* Error Message */}
        <Typography variant="body1" sx={{ fontSize: '1.25rem', marginBottom: '30px' }}>
          An error has occurred, to continue:
        </Typography>
        
        <Typography variant="body1" sx={{ fontSize: '1.25rem' }}>
          * Return to our homepage.<br />
          * Send us an e-mail about this error and try later.
        </Typography>

        {/* Link to go Home */}
        <Box sx={{ marginTop: '35px', textAlign: 'center' }}>
          <Button href="/" variant="text" sx={{ color: '#e0e2f4', fontWeight: 'bold', fontSize: '1.25rem', '&:hover': { backgroundColor: '#aaaaaa', color: '#000' } }}>
            Click to go Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFoundPage;