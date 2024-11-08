import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Card, Chip, CardMedia, useMediaQuery, Paper, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Checkbox, TextField, Radio, RadioGroup, FormControlLabel, FormControl
} from '@mui/material';
import axios from 'axios';
import dummyImage from './noimage.jpg';

const ProductDetails = ({ product, goBack }) => {
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [availableFor, setAvailableFor] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [status, setStatus] = useState(product.status || 'hidden');
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchAdditionalDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (product.color_available) {
                    const colorResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products/${product.id}/colors`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setColors(colorResponse.data.colors);
                }
                if (product.size_available) {
                    const sizeResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products/${product.id}/sizes`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setSizes(sizeResponse.data.sizes);
                }

                if (product.available_for) {
                    setAvailableFor(product.available_for);
                }
            } catch (error) {
                console.error('Error fetching additional product details:', error);
            }
        };

        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsSuperAdmin(userResponse.data.superAdmin);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchAdditionalDetails();
        fetchUserDetails();
    }, [product]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/products/${product.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`Product ${product.name} deleted.`);
            goBack();
            window.location.reload();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
        setOpenStatusDialog(true);
    };

    const confirmStatusChange = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/admin/products/${product.id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOpenStatusDialog(false);
            window.location.reload();
        } catch (error) {
            console.error('Error updating product status:', error);
        }
    };

    const isDeleteEnabled = isCheckboxChecked && confirmText === `delete ${product.name}`;

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.image_urls.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.image_urls.length) % product.image_urls.length);
    };

    return (
        <Box sx={{
            width: '100%', // Full width of the page
            margin: '0 auto', // Center content horizontally
            boxSizing: 'border-box !important', // Include padding in the width
            padding: '16px', // Internal padding
            overflowX: 'hidden', // Prevent horizontal scrolling
        }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button onClick={goBack} variant="contained" color="primary">Back to Products</Button>
                <Button
                    onClick={() => setOpenDialog(true)}
                    variant="contained"
                    color="error"
                    disabled={!isSuperAdmin}
                >
                    Delete Product
                </Button>
            </Box>
            <Typography variant="h4" gutterBottom fontSize={isMobile ? '1.5rem' : '2rem'}>{product.name}</Typography>
            <Typography variant="h6" color="text.secondary" fontSize={isMobile ? '1rem' : '1.25rem'}>{product.category}</Typography>
            <Typography variant="h5" color="primary" sx={{ my: 2 }} fontSize={isMobile ? '1.25rem' : '1.5rem'}>
                ₹{product.price}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, fontSize: isMobile ? '0.875rem' : '1rem' }}>{product.description}</Typography>

            <Card
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%', // Full width of the component
                    maxWidth: isMobile ? '100%' : '800px', // Constrain width for larger screens
                    margin: '10px auto', // Center align the card
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                    padding: '16px', // Add padding inside the card
                    boxSizing: 'border-box', // Ensure padding is included in width
                }}
            >
                <Button
                    onClick={handlePrevImage}
                    sx={{
                        position: 'absolute',
                        left: '16px', // Inside the padding
                        zIndex: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        minWidth: 'auto',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                >
                    ←
                </Button>
                <CardMedia
                    component="img"
                    image={product.image_urls[currentImageIndex]}
                    alt={`${product.name} image`}
                    sx={{
                        width: '100%', // Image takes full width of the card
                        height: 'auto',
                        objectFit: 'contain',
                    }}
                    onError={(e) => {
                        e.target.src = dummyImage;
                    }}
                />
                <Button
                    onClick={handleNextImage}
                    sx={{
                        position: 'absolute',
                        right: '16px', // Inside the padding
                        zIndex: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        minWidth: 'auto',
                        padding: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                >
                    →
                </Button>
            </Card>

            <Paper
                elevation={3}
                sx={{
                    padding: 2,
                    mt: 3,
                    borderRadius: 3,
                    backgroundColor: "#f9f9f9",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    maxWidth: isMobile ? '100%' : '500px',
                    margin: '10 0'
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">Product ID: {product.id}</Typography>
                <Typography variant="subtitle1" fontWeight="bold">Customizable: {product.customizable_name ? "Yes" : "No"}</Typography>
                <Typography variant="subtitle1" fontWeight="bold">Created At: {formatDate(product.created_at)}</Typography>
                <Typography variant="subtitle1" fontWeight="bold">Updated At: {formatDate(product.updated_at)}</Typography>
            </Paper>

            {colors.length > 0 && (
                <Paper
                    elevation={1}
                    sx={{
                        my: 2,
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "#e3f2fd",
                        maxWidth: isMobile ? '100%' : '500px',
                        margin: '10 0'
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">Available Colors:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {colors.map((color, index) => (
                            <Chip key={index} label={color} color="primary" variant="outlined" />
                        ))}
                    </Box>
                </Paper>
            )}

            {sizes.length > 0 && (
                <Paper
                    elevation={1}
                    sx={{
                        my: 2,
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "#f3e5f5",
                        maxWidth: isMobile ? '100%' : '500px',
                        margin: '10px 0'
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">Available Sizes:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {sizes.map((size, index) => (
                            <Chip key={index} label={size} color="secondary" variant="outlined" />
                        ))}
                    </Box>
                </Paper>
            )}

            {availableFor.length > 0 && (
                <Paper
                    elevation={1}
                    sx={{
                        my: 2,
                        padding: 2,
                        borderRadius: 2,
                        backgroundColor: "#e8f5e9",
                        maxWidth: isMobile ? '100%' : '500px',
                        margin: '10px 0'
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">Available For:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {availableFor.map((group, index) => (
                            <Chip key={index} label={group} color="success" variant="outlined" />
                        ))}
                    </Box>
                </Paper>
            )}

            <FormControl component="fieldset" sx={{ my: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Product Status</Typography>
                <RadioGroup row value={status} onChange={handleStatusChange}>
                    <FormControlLabel
                        value="live"
                        control={<Radio color="success" />}
                        label="Live"
                        disabled={!isSuperAdmin}
                    />
                    <FormControlLabel
                        value="hidden"
                        control={<Radio color="error" />}
                        label="Hidden"
                        disabled={!isSuperAdmin}
                    />
                </RadioGroup>
            </FormControl>

            <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
                <DialogTitle>Confirm Status Change</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to change the status to "{status}"? This will immediately apply the new status.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenStatusDialog(false)} color="primary">Cancel</Button>
                    <Button onClick={confirmStatusChange} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Product Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'red' }}>
                        Are you sure you want to delete this product? This process is irreversible!
                    </DialogContentText>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Checkbox
                            checked={isCheckboxChecked}
                            onChange={(e) => setIsCheckboxChecked(e.target.checked)}
                        />
                        <Typography variant="body2">I understand the consequences.</Typography>
                    </Box>
                    <TextField
                        label={`Type "delete ${product.name}" to confirm`}
                        variant="outlined"
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">Cancel</Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        disabled={!isDeleteEnabled}
                    >
                        Delete Product
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductDetails;