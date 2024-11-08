import React, { useEffect, useState } from 'react';
import { Grid, Alert, Snackbar } from '@mui/material';
import axios from 'axios';
import CardComponent from './Card';

const Products = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [userType, setUserType] = useState('');

  // Fetch user data to get userType and then product data
  useEffect(() => {
    const fetchUserDataAndProducts = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch current user's information
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const currentUser = userResponse.data;
        setUserType(currentUser.userType);

        // Fetch products
        const productsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products-with-images`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter products based on the user's userType and status
        const filteredProducts = productsResponse.data.products.filter(product =>
          product.available_for.includes(currentUser.userType) && product.status === 'live'
        );

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products or user data:', error);
      }
    };

    fetchUserDataAndProducts();
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Grid container spacing={3} justifyContent="flex-start" alignItems="center" width="100vw">
      {products.map(({ id, name, price, image_urls, size_available, color_available, customizable_name, description }) => (
        <Grid item key={id} xs={12} sm={6} md={4} lg={4} sx={{ padding: '10px !important' }}>
          <CardComponent
            p_id={id}
            p_name={name}
            p_price={price}
            p_img={image_urls}
            size_available={size_available}
            customizable_name={customizable_name}
            color_available={color_available}
            description={description}
            setOpen={setOpen}
            cart={cart}
            setCart={setCart}
          />
        </Grid>
      ))}

      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning">
          Please select a size before adding to the cart.
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default Products;