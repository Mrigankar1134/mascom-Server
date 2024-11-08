import React, { useEffect, useState } from 'react';
import { Button, Grid, Typography, Alert, Fab } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import CartList from './CartList';
import Products from './Products';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const Cart = ({ cart, setCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = location.state?.userType;
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState({ msg: 'Cart Empty', state: false });

  // Load cart data from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [setCart]);

  // Save cart data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Scroll-to-top button visibility based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Check if the cart is empty
  const isCartEmpty = Array.isArray(cart) && cart.length === 0;

  // Calculate total price of items in the cart
  const totalPrice = cart.reduce((sum, item) => sum + item.p_price * item.p_count, 0);

  // Handle purchase button click
  const handlePurchase = () => {
    if (isCartEmpty || totalPrice === 0) {
      setError({ msg: 'Cart is empty, please add items to proceed.', state: true });
      return;
    }

    // Save cart data to localStorage and navigate to /pay with cart data
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate('/pay', { state: { cart } });
  };

  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="center">
        {/* Navbar */}
        <Grid
          item
          xs={12}
          style={{
            paddingTop: '0',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            backgroundColor: '#fff',
          }}
        >
          <Navbar />
        </Grid>

        {/* Cart Content */}
        <Grid item xs={12} sm={8} md={6} style={{ padding: '40px', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Your Cart
          </Typography>
          <Typography gutterBottom>
            Select the products that you want and then press <b>Purchase</b>.
          </Typography>
          <br />

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            sx={{
              bgcolor: '#000000',
              '&:hover': {
                backgroundColor: '#000000',
              },
            }}
            fullWidth
            color="primary"
            variant="contained"
            disabled={totalPrice === 0} // Disable if total price is zero
          >
            Purchase
          </Button>

          <br /><br /><br />

          {/* Total Price */}
          <Typography variant="h5">
            <b>Total&nbsp;Price:&nbsp;&#8377;&nbsp;{totalPrice}</b>
          </Typography>

          {/* Empty Cart Message or Cart List */}
          {isCartEmpty ? (
            <Typography>Your Cart is Empty</Typography>
          ) : (
            <>
              <CartList cart={cart} setCart={setCart} />
              <br />
            </>
          )}
        </Grid>
        
        {/* Products list */}
        <Grid container item xs={12} spacing={4} sx={{ marginLeft: '25px', rowGap: '30px' }}>
          <Products cart={cart} setCart={setCart} />
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error.state && <Alert severity="warning">{error.msg}</Alert>}

      {/* Floating Scroll-to-Top Button */}
      {showButton && (
        <Fab
          color="primary"
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000,
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
      )}
    </React.Fragment>
  );
};

export default Cart;