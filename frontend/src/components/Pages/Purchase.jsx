import React, { useEffect, useState } from 'react';
import { Grid, Typography, Button } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if the order has been confirmed
        const orderConfirmed = localStorage.getItem('orderConfirmed');
        
        if (orderConfirmed) {
            setIsOrderConfirmed(true);
            setIsLoading(false);

            // Clean up after displaying confirmation message
            setTimeout(() => {
                localStorage.removeItem('cart');
                localStorage.removeItem('orderConfirmed');
            }, 500); // Adjust delay if necessary
        } else {
            // Redirect to cart if the order is not confirmed
            navigate('/cart');
        }
    }, [navigate]);

    // Prevent the user from navigating back to avoid showing the order again
    useEffect(() => {
        const handleBackButton = (event) => {
            event.preventDefault();
            window.history.pushState(null, null, window.location.pathname);
        };

        window.history.pushState(null, null, window.location.pathname);
        window.addEventListener('popstate', handleBackButton);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, []);

    if (isLoading) {
        return (
            <Typography variant="h6" align="center" style={{ marginTop: '20%' }}>
                Loading...
            </Typography>
        );
    }

    return (
        <Grid container marginTop={10} spacing={2} flexDirection='column' justifyContent="center" alignItems="center">
            {isOrderConfirmed && (
                <>
                    <Grid item xs={12} sm={6}>
                        <CheckCircleOutlinedIcon sx={{ fontSize: 100 }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant='h4'>Order Placed!</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography align='center'>For queries regarding your order, please email <b>mascom@iimamritsar.ac.in</b></Typography>
                        <Typography align='center' sx={{ color: "red" }}><b>Please close this browser window</b></Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ marginTop: 3 }}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate('/order')}
                            sx={{ marginBottom: 2 }}
                        >
                            View Your Order
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate('/cart')}
                            sx={{
                                bgcolor: "#000000",
                                color: "#ffffff",
                                '&:hover': {
                                    backgroundColor: '#333333',
                                }
                            }}
                        >
                            Purchase More
                        </Button>
                    </Grid>
                </>
            )}
        </Grid>
    );
};

export default Home;