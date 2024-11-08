import React, { useEffect, useState } from 'react';
import {
    Box, Card, CardContent, CardMedia, Typography, Grid, CircularProgress, Button, IconButton,
} from '@mui/material';
import axios from 'axios';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import ProductDetails from './ProductDetails';
import dummyImage from './noimage.jpg';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products-with-images`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProducts(response.data.products);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;

    if (selectedProduct) {
        return <ProductDetails product={selectedProduct} goBack={() => setSelectedProduct(null)} />;
    }

    return (
        <Box sx={{ padding: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>Product List</Typography>
            <Grid container spacing={3} justifyContent="center">
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <ProductCard product={product} onViewDetails={() => setSelectedProduct(product)} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

const ProductCard = ({ product, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === product.image_urls.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? product.image_urls.length - 1 : prevIndex - 1
        );
    };

    const imageUrl = product.image_urls.length ? product.image_urls[currentImageIndex] : dummyImage;

    return (
        <Card
            sx={{
                width: '100%', // Responsive card width
                maxWidth: 345, // Limit card width
                margin: 'auto', // Center the card
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', // Add subtle shadow
            }}
        >
            <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={product.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    onError={(e) => { e.target.src = dummyImage; }}
                />
                {product.image_urls.length > 1 && (
                    <>
                        <IconButton
                            onClick={handlePrevImage}
                            sx={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)', color: '#fff' }}
                        >
                            <ArrowBackIos />
                        </IconButton>
                        <IconButton
                            onClick={handleNextImage}
                            sx={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)', color: '#fff' }}
                        >
                            <ArrowForwardIos />
                        </IconButton>
                    </>
                )}
            </Box>
            <CardContent>
                <Typography variant="h5" component="div">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">{product.category}</Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>₹{product.price}</Typography>
            </CardContent>
            <Button size="small" color="primary" onClick={onViewDetails}>View Details</Button>
        </Card>
    );
};

export default ProductList;


