import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  TextField,
  Box,
  Alert as MuiAlert,
} from '@mui/material';
import axios from 'axios';

const VerifyPayment = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeclineDialog, setOpenDeclineDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [declineField, setDeclineField] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [openScreenshotDialog, setOpenScreenshotDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminId(response.data.id);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to retrieve user information.');
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!adminId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/my-payments`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { adminId },
        });
        setPaymentData(response.data);
      } catch (error) {
        console.error('Error fetching payment data:', error);
        setError('Failed to fetch payment data.');
      }
    };

    fetchPayments();
  }, [adminId]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleVerify = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/verify-payment`,
        { orderId: selectedOrderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSnackbar('Payment verified successfully!', 'success');
      setPaymentData(paymentData.filter(order => order.id !== selectedOrderId));
      setOpenDialog(false);
    } catch (error) {
      console.error('Error verifying payment:', error);
      showSnackbar('Failed to verify payment.', 'error');
    }
  };

  const handleDecline = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/decline-payment`,
        { orderId: selectedOrderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSnackbar('Payment declined successfully!', 'success');
      setPaymentData(paymentData.filter(order => order.id !== selectedOrderId));
      setOpenDeclineDialog(false);
    } catch (error) {
      console.error('Error declining payment:', error);
      showSnackbar('Failed to decline payment.', 'error');
    }
  };

  const handleOpenDialog = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenDialog(true);
    setConfirmCheck(false);
  };

  const handleOpenDeclineDialog = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenDeclineDialog(true);
    setDeclineField('');
    setConfirmCheck(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDeclineDialog(false);
    setSelectedOrderId(null);
  };

  const handleScreenshotDialogOpen = (url) => {
    setScreenshotUrl(url);
    setOpenScreenshotDialog(true);
  };

  const handleScreenshotDialogClose = () => {
    setOpenScreenshotDialog(false);
    setScreenshotUrl('');
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Verify Payments
      </Typography>
      {error && <MuiAlert severity="error">{error}</MuiAlert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Buyer Name</strong></TableCell>
            <TableCell><strong>Amount</strong></TableCell>
            <TableCell><strong>Transaction ID</strong></TableCell>
            <TableCell><strong>Screenshot</strong></TableCell>
            <TableCell sx={{ width: '300px' }}><strong>Action</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paymentData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.buyer_name}</TableCell>
              <TableCell>₹ {row.total_price}</TableCell>
              <TableCell>{row.transaction_id}</TableCell>
              <TableCell>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => handleScreenshotDialogOpen(row.screenshot_url)}
                >
                  View Screenshot
                </Button>
              </TableCell>
              <TableCell>
                {row.payment_status === 'Verification Pending' && (
                  <>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        '&:hover': { backgroundColor: '#333' },
                        m: 1
                      }}
                      onClick={() => handleOpenDialog(row.id)}
                    >
                      Verify
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: 'red',
                        color: 'white',
                        '&:hover': { backgroundColor: '#b30000' },
                        m: 1
                      }}
                      onClick={() => handleOpenDeclineDialog(row.id)}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Verify Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Verify Payment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to verify this payment?</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmCheck}
                onChange={(e) => setConfirmCheck(e.target.checked)}
              />
            }
            label="I confirm to verify this payment"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: 'red' }}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={!confirmCheck}
            sx={{
              backgroundColor: confirmCheck ? 'black' : 'grey',
              color: 'white',
              '&:hover': confirmCheck ? { backgroundColor: '#333' } : {},
            }}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={openDeclineDialog} onClose={handleCloseDialog}>
        <DialogTitle>Decline Payment</DialogTitle>
        <DialogContent>
          <Typography>To decline this payment, confirm by entering the word "Decline".</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmCheck}
                onChange={(e) => setConfirmCheck(e.target.checked)}
              />
            }
            label="I confirm to decline this payment"
          />
          <TextField
            label="Enter 'Decline'"
            fullWidth
            margin="normal"
            value={declineField}
            onChange={(e) => setDeclineField(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: 'red' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDecline}
            disabled={!confirmCheck || declineField.toLowerCase() !== 'decline'}
            sx={{
              backgroundColor: confirmCheck && declineField.toLowerCase() === 'decline' ? 'red' : 'grey',
              color: 'white',
              '&:hover': confirmCheck && declineField.toLowerCase() === 'decline' ? { backgroundColor: '#b30000' } : {},
            }}
          >
            Decline
          </Button>
        </DialogActions>
      </Dialog>

      {/* Screenshot Dialog */}
      <Dialog open={openScreenshotDialog} onClose={handleScreenshotDialogClose}>
        <DialogTitle>Payment Screenshot</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src={screenshotUrl}
              alt="Screenshot"
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScreenshotDialogClose} sx={{ color: 'red' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </TableContainer>
  );
};

export default VerifyPayment;