import React, { useState } from 'react';
import { Grid, TextField, Button, Box, Typography, InputAdornment, IconButton, CircularProgress, Alert } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import Navbar from './Navbar'

const ForgotPasswordForm = () => {
  const [step, setStep] = useState(1); // Track the current step
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null); // For success/error messages

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await axios.post('/api/send-otp', { email });
      setStep(2);
      setMessage({ type: 'success', text: 'OTP sent to your email!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await axios.post('/api/verify-otp', { otp });
      setStep(3);
      setMessage({ type: 'success', text: 'OTP verified! Enter a new password.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/change-password', { password });
      setMessage({ type: 'success', text: 'Password changed successfully! Redirecting to login...' });
      // Optionally redirect to login after a delay
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12}>
        <Navbar />
      </Grid>
      <Grid item xs={8} sm={4}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ maxWidth: 900, mx: 'auto', mt: 4, p: 3, borderRadius: 2, boxShadow: 3 }}
      >
        <Typography variant="h5" mb={2} fontWeight="bold">
          Forgot Password
        </Typography>

        {message && (
          <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {step === 1 && (
          <>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" color="primary" fullWidth variant="contained" 
              disabled={loading} sx={{ bgcolor: "#000" }} 
              onClick={handleSendOtp}>
            {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
          </>
        )}

        {step === 2 && (
          <>
            <TextField
              label="Enter OTP"
              variant="outlined"
              fullWidth
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <TextField
              label="New Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              variant="outlined"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </>
        )}
      </Box>
      </Grid>
    </Grid>
  );
};

export default ForgotPasswordForm;