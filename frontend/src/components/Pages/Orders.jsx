import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Select, MenuItem, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Collapse, Fab, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import axios from 'axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [openOrderDetails, setOpenOrderDetails] = useState({});
    const [showButton, setShowButton] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    // Define the desired order of sizes
    const sizeOrder = ['2XS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'];

    // Function to sort sizes based on predefined order
    const sortSizes = (sizes) => {
        return sizes.sort((a, b) => {
            return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
        });
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/orders`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                
                // Sort available sizes in each order item
                const sortedOrders = response.data.orders.map(order => ({
                    ...order,
                    items: order.items.map(item => ({
                        ...item,
                        available_sizes: item.available_sizes ? sortSizes(item.available_sizes) : [],
                    }))
                }));

                setOrders(sortedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                handleSnackbar('Failed to fetch orders.', 'error');
            }
        };
        fetchOrders();

        const handleScroll = () => {
            setShowButton(window.scrollY > 200);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleOptionChange = (orderId, itemId, field, value) => {
        setSelectedOptions(prevOptions => ({
            ...prevOptions,
            [`${orderId}-${itemId}-${field}`]: value,
        }));
    };

    const handleSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const submitUpdate = async (orderId, itemId) => {
        const selectedSize = selectedOptions[`${orderId}-${itemId}-size`];
        const selectedColor = selectedOptions[`${orderId}-${itemId}-color`];

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/order/${orderId}/item/${itemId}`, {
                size: selectedSize,
                color: selectedColor
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            handleSnackbar('Options updated successfully', 'success');
        } catch (error) {
            console.error('Error updating options:', error);
            handleSnackbar('Failed to update options', 'error');
        }
    };

    const toggleOrderDetails = (orderId) => {
        setOpenOrderDetails(prevState => ({
            ...prevState,
            [orderId]: !prevState[orderId],
        }));
    };

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <Navbar />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{
                        padding: { xs: 2, md: 4 },
                        width: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>Order History</Typography>
                        
                        <TableContainer component={Paper} sx={{ marginBottom: 4, overflowX: 'hidden', boxSizing: 'border-box' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Transaction ID</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map(order => (
                                        <React.Fragment key={order.id}>
                                            <TableRow>
                                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>{order.transaction_id}</TableCell>
                                                <TableCell>₹{order.total_price}</TableCell>
                                                <TableCell>{order.payment_status}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{bgcolor: "#333", color: "#fff", '&:hover': { bgcolor: "#555" }}}
                                                        onClick={() => toggleOrderDetails(order.id)}
                                                    >
                                                        {openOrderDetails[order.id] ? "Hide Details" : "View Details"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>

                                            <TableRow>
                                                <TableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                                    <Collapse in={openOrderDetails[order.id]} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 2, boxSizing: 'border-box' }}>
                                                            <Typography variant="h6" gutterBottom>Order Items</Typography>
                                                            <Grid container spacing={2}>
                                                                {order.items.map(item => (
                                                                    <Grid item xs={12} md={6} key={item.item_id}>
                                                                        <Box sx={{ border: '1px solid #ddd', padding: 2, borderRadius: '4px', backgroundColor: '#f9f9f9', boxSizing: 'border-box' }}>
                                                                            <Typography><b>Product:</b> {item.product_name}</Typography>
                                                                            <Typography><b>Price:</b> ₹{item.price}</Typography>
                                                                            <Typography><b>Quantity:</b> {item.quantity}</Typography>
                                                                            <Typography><b>Current Size:</b> {item.size || 'N/A'}</Typography>
                                                                            <Typography><b>Current Color:</b> {item.color || 'N/A'}</Typography>

                                                                            {/* Conditional Dropdowns */}
                                                                            <Box display="flex" flexDirection={item.available_sizes && item.available_colors ? 'row' : 'column'} justifyContent="space-between" sx={{ marginTop: 2 }}>
                                                                                {/* Size Selection */}
                                                                                {item.available_sizes && item.available_sizes.length > 1 && (
                                                                                    <Select
                                                                                        value={selectedOptions[`${order.id}-${item.item_id}-size`] || item.size || ''}
                                                                                        onChange={(e) => handleOptionChange(order.id, item.item_id, 'size', e.target.value)}
                                                                                        sx={{ width: item.available_colors ? '48%' : '100%', marginBottom: item.available_colors ? 0 : 1 }}
                                                                                        displayEmpty
                                                                                    >
                                                                                        <MenuItem value="" disabled>Select Size</MenuItem>
                                                                                        {item.available_sizes.map(size => (
                                                                                            <MenuItem key={size} value={size}>{size}</MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                )}

                                                                                {/* Color Selection */}
                                                                                {item.available_colors && item.available_colors.length > 1 && (
                                                                                    <Select
                                                                                        value={selectedOptions[`${order.id}-${item.item_id}-color`] || item.color || ''}
                                                                                        onChange={(e) => handleOptionChange(order.id, item.item_id, 'color', e.target.value)}
                                                                                        sx={{ width: item.available_sizes ? '48%' : '100%' }}
                                                                                        displayEmpty
                                                                                    >
                                                                                        <MenuItem value="" disabled>Select Color</MenuItem>
                                                                                        {item.available_colors.map(color => (
                                                                                            <MenuItem key={color} value={color}>{color}</MenuItem>
                                                                                        ))}
                                                                                    </Select>
                                                                                )}
                                                                            </Box>

                                                                            <Button
                                                                                variant="contained"
                                                                                sx={{ marginTop: 2, width: '100%', bgcolor: "#333", color: "#fff", '&:hover': { bgcolor: "#555" } }}
                                                                                onClick={() => submitUpdate(order.id, item.item_id)}
                                                                            >
                                                                                Update Size/Color
                                                                            </Button>
                                                                        </Box>
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Grid>
            </Grid>

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

            {/* Snackbar Alert */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </React.Fragment>
    );
};

export default Orders;