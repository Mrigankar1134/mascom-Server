import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, TextField, Checkbox, Button, FormControlLabel, Box, Alert, Divider, Backdrop, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Navbar from '../Navbar'; 
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

const validationSchema = Yup.object({
    transactionId: Yup.string().required('*UTR Number or Transaction ID is required'),
    agree: Yup.boolean().oneOf([true], '*You must agree to continue')
});

const Pay = () => {
    const [qr, setQr] = useState(0);
    const qrs = [require('../qr2.jpg'), require('../qr3.jpg'), require('../qr1.jpeg'), require('../qr5.jpg'), require('../qr4.jpg'), require('../qr6.jpg')];
    const qrNames = ["Sanat", "Venkat", "Pragya", "Unnati", "Mrigankar", "Suraj"]; // Names corresponding to the QR codes
    const [file, setFile] = useState(null);
    const [renamedFile, setRenamedFile] = useState('');
    const [error, setError] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [userData, setUserData] = useState(null); 
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [isPayButtonEnabled, setIsPayButtonEnabled] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setUserData(response.data); 
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Failed to retrieve user data.');
            }
        };
        fetchUserData();
    }, []);

    const handleFileChange = (event) => {
        const uploadedFile = event.target.files[0];
        const rollNumber = userData?.Roll_Number; 
        if (uploadedFile) {
            const fileExtension = uploadedFile.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png') {
                setError('Only JPG or PNG files are allowed.');
                return;
            }
            setError(''); 
            if (rollNumber) {
                const newFileName = `${rollNumber}.${fileExtension}`;
                const renamedFile = new File([uploadedFile], newFileName, { type: uploadedFile.type });
                setFile(renamedFile);
                setRenamedFile(newFileName);
                setFileUrl(newFileName);
                checkIfAllDetailsEntered(newFileName, null, null); 
            } else {
                setError('Roll number not found.');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.');
            return null;
        }
        try {
            const formData = new FormData();
            formData.append('file', file);
    
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-screenshot`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFileUrl(response.data.screenshotUrl);
            return response.data.screenshotUrl;
        } catch (err) {
            console.error("Error uploading file:", err);
            setError('Failed to upload file.');
            return null;
        }
    };

    const handlePay = async (values) => {
        setOpen(true); // Show loading spinner
    
        const screenshotUrl = await handleUpload();
    
        if (!screenshotUrl) {
            setOpen(false);
            return; // Exit if screenshot URL isn't available
        }
    
        // Retrieve cart data from localStorage
        const cart = JSON.parse(localStorage.getItem("cart"));
        const total_price = cart.reduce((sum, item) => sum + item.p_price * item.p_count, 0);
    
        // Prepare the order items array, including custom_name if available
        const order_items = cart.map(item => ({
            product_id: item.p_id,
            quantity: item.p_count,
            size: item.p_size,
            color: item.p_color,
            price: item.p_price,
            custom_name: item.custom_name
        }));
    
        const orderData = {
            total_price: total_price,
            transaction_id: values.transactionId,
            order_items: order_items,
            screenshot_url: screenshotUrl,
            paid_to: qrNames[qr] // Add QR name to the payload
        };
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/order`, orderData, {
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (response.status === 201) {
    
                // Set the order confirmation in localStorage
                localStorage.setItem('orderConfirmed', 'true');
                localStorage.removeItem("cart");
                    navigate('/purchase', { replace: true });
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setError('Error placing order. Please try again.');
        } finally {
            setOpen(false);
        }
    };

    const handleClose = () => setOpen(false);
    const handleQr = (event) => setQr(event.target.value);

    const checkIfAllDetailsEntered = (filePresent, transactionId, agree) => {
        setIsPayButtonEnabled(!!(filePresent && transactionId && agree));
    };

    return (
        <React.Fragment>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12}>
                    <Navbar />
                </Grid>
                <Grid item xs={12} sm={6} style={{ height: 'calc(100vh - 64px)', padding: "40px" }} justifyContent="center">
                    <Typography variant='h5'>Amount to be Paid: <b>Rs. {JSON.parse(localStorage.getItem("cart")).reduce((sum, item) => sum + item.p_price * item.p_count, 0)}</b></Typography>
                    <br />
                    <Typography><b>Select a QR Code from below.</b></Typography>
                    <Typography sx={{ fontSize: 12 }}>(If one does not work, try another. If none work, please contact a MasCom member)</Typography>
                    <FormControl variant='filled' fullWidth>
                        <InputLabel>Pay To (Select a QR from the dropdown)</InputLabel>
                        <Select name='Pay To' value={qr} onChange={handleQr}>
                            <MenuItem value={0}>Sanat</MenuItem>
                            <MenuItem value={1}>Venkat</MenuItem>
                            <MenuItem value={2}>Pragya</MenuItem>
                            <MenuItem value={3}>Unnati</MenuItem>
                            <MenuItem value={4}>Mrigankar</MenuItem>
                            <MenuItem value={5}>Suraj</MenuItem>
                        </Select>
                    </FormControl>
                    <img alt='QR Code' style={{ width: "100%", height: 'auto' }} src={qrs[qr]} />
                    <Box>
                        {renamedFile && (
                            <TextField variant="outlined" fullWidth margin="normal" value={renamedFile} InputProps={{ readOnly: true }} />
                        )}
                        <input accept="image/jpeg,image/png" style={{ display: 'none' }} id="raised-button-file" type="file" onChange={handleFileChange} />
                        <label htmlFor="raised-button-file">
                            <Button sx={{ bgcolor: "#000000", '&:hover': { backgroundColor: '#000000' } }} variant="contained" component="span" fullWidth>
                                Upload Payment Screenshot
                            </Button>
                        </label>
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Formik
                        initialValues={{ transactionId: '', agree: false }}
                        validationSchema={validationSchema}
                        onSubmit={handlePay}
                    >
                        {({ values, handleChange, handleBlur }) => (
                            <Form>
                                <Field
                                    as={TextField}
                                    name="transactionId"
                                    label="UTR Number or Transaction ID"
                                    variant="outlined"
                                    fullWidth
                                    onBlur={(e) => {
                                        handleBlur(e);
                                        checkIfAllDetailsEntered(fileUrl, e.target.value, values.agree);
                                    }}
                                    onChange={(e) => {
                                        handleChange(e);
                                        checkIfAllDetailsEntered(fileUrl, e.target.value, values.agree);
                                    }}
                                />
                                <ErrorMessage name="transactionId" component="div" style={{ color: 'red' }} />
                                <FormControlLabel
                                    control={
                                        <Field
                                            as={Checkbox}
                                            name="agree"
                                            color="primary"
                                            onChange={(e) => {
                                                handleChange(e);
                                                checkIfAllDetailsEntered(fileUrl, values.transactionId, e.target.checked);
                                            }}
                                        />
                                    }
                                    label={<span style={{ fontWeight: 'bold' }}>I Agree</span>}
                                />
                                <ErrorMessage name="agree" component="div" style={{ color: 'red' }} />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{ bgcolor: "#000000", '&:hover': { backgroundColor: '#000000' } }}
                                    fullWidth
                                    disabled={!isPayButtonEnabled}
                                >
                                    Pay
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Grid>
            </Grid>
            <Backdrop sx={{ color: '#fff' }} open={open}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </React.Fragment>
    );
};

export default Pay;