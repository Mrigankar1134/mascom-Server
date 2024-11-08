import React, { useState, useEffect } from 'react';
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, TextField, Button, MenuItem, Select, useMediaQuery
} from '@mui/material';
import axios from 'axios';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState('name');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userDetails, setUserDetails] = useState(null);

    // Detect if the screen width is small (mobile view)
    const isMobile = useMediaQuery('(max-width:600px)');

    // Fetch all users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    // Handle viewing a user's details
    const handleViewUser = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/user/${user.id}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Update the state with the fetched user details
            setUserDetails({
                userDetails: response.data.userDetails, // Updated to match backend response
                orders: response.data.orders || [],   // Assuming `orders` might be an empty array
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    // Filter users based on search term and filter field
    const handleFilter = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        setFilteredUsers(users.filter(user => user[filterField]?.toLowerCase().includes(term)));
    };

    // Function to go back to the main user list
    const handleBackToUserList = () => {
        setUserDetails(null);
    };

    return (
        <Box sx={{ padding: 3 }}>
            {userDetails ? (
                // User Detail View
                <Box>
                    <Typography variant="h4" gutterBottom>
                        User Details: {userDetails.userDetails.name}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={handleBackToUserList}
                        sx={{ mb: 2 }}
                    >
                        Back to User List
                    </Button>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography><strong>Email:</strong> {userDetails.userDetails.email || 'N/A'}</Typography>
                        <Typography><strong>Phone:</strong> {userDetails.userDetails.phone || 'N/A'}</Typography>
                        <Typography><strong>Section:</strong> {userDetails.userDetails.section || 'N/A'}</Typography>
                        <Typography><strong>Roll Number:</strong> {userDetails.userDetails.roll_number || 'N/A'}</Typography>
                        <Typography><strong>Hostel:</strong> {userDetails.userDetails.hostel || 'N/A'}</Typography>
                        <Typography><strong>Status:</strong> {userDetails.userDetails.status || 'N/A'}</Typography>
                        <Typography><strong>Last Login:</strong> {userDetails.userDetails.last_login || 'N/A'}</Typography>
                        <Typography><strong>Password:</strong> {userDetails.userDetails.password || 'N/A'}</Typography>
                        <Typography><strong>Is Admin:</strong> {userDetails.userDetails.isAdmin ? 'Yes' : 'No'}</Typography>
                    </Paper>

                    <Typography variant="h5" sx={{ mt: 4 }}>Recent Orders</Typography>
                    {userDetails.orders.length > 0 ? (
                        userDetails.orders.map((order) => (
                            <Paper key={order.order_id} sx={{ my: 2, p: 2 }}>
                                <Typography><strong>Order ID:</strong> {order.order_id}</Typography>
                                <Typography><strong>Total Price:</strong> ₹{order.total_price}</Typography>
                                <Typography><strong>Status:</strong> {order.payment_status}</Typography>
                                <Typography><strong>Transaction ID:</strong> {order.transaction_id}</Typography>
                                <Typography><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</Typography>

                                <Typography variant="h6" sx={{ mt: 2 }}>Items</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product Name</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Size</TableCell>
                                                <TableCell>Color</TableCell>
                                                <TableCell>Custom Name</TableCell>
                                                <TableCell>Price</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {order.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.product_name}</TableCell>
                                                    <TableCell>{item.quantity}</TableCell>
                                                    <TableCell>{item.size_id || 'N/A'}</TableCell>
                                                    <TableCell>{item.color_id || 'N/A'}</TableCell>
                                                    <TableCell>{item.custom_name || 'N/A'}</TableCell>
                                                    <TableCell>₹{item.price}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ))
                    ) : (
                        <Typography>No orders found.</Typography>
                    )}
                </Box>
            ) : (
                // Main User List View
                <Box>
                    <Typography variant="h4" gutterBottom>Manage Users</Typography>

                    {/* Filter and Search Section */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            label="Search Users"
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleFilter}
                            sx={{ flex: 1 }}
                        />
                        <Select
                            value={filterField}
                            onChange={(e) => setFilterField(e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="name">Name</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="roll_number">Roll No</MenuItem>
                        </Select>
                    </Box>

                    {/* User Table */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    {!isMobile && <TableCell>Email</TableCell>}
                                    {!isMobile && <TableCell>Phone</TableCell>}
                                    {!isMobile && <TableCell>Roll No</TableCell>}
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name || 'N/A'}</TableCell>
                                        {!isMobile && <TableCell>{user.email || 'N/A'}</TableCell>}
                                        {!isMobile && <TableCell>{user.phone || 'N/A'}</TableCell>}
                                        {!isMobile && <TableCell>{user.roll_number || 'N/A'}</TableCell>}
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleViewUser(user)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
};

export default ManageUsers;