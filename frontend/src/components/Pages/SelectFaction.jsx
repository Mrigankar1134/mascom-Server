import React from 'react';
import { Grid, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';

const UserSelection = () => {
  const navigate = useNavigate();

  const handleSelection = (userType) => {
    navigate('/cart', { state: { userType } });
  };

  return (
    <React.Fragment>
  <Grid container spacing={2} style={{ height: '100vh' }}>
    <Grid item xs={12}>
      <Navbar />
    </Grid>
    <Grid
      item
      xs={12}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center', 
        width: '100%',
        marginTop: '-600px'
      }}
    >
      <Typography variant="h4" gutterBottom>
        Select Your Batch
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          sx={{ bgcolor: '#000000', '&:hover': { backgroundColor: '#000000' } }}
          onClick={() => handleSelection('titans')}
        >
          Titans
        </Button>
        <Button
          variant="contained"
          sx={{ bgcolor: '#000000', '&:hover': { backgroundColor: '#000000' } }}
          onClick={() => handleSelection('nyxens')}
        >
          Nyxen
        </Button>
      </Box>
    </Grid>
  </Grid>
</React.Fragment>
  );
};

export default UserSelection;