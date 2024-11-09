import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Alert, Backdrop, TextField, Button, Box, MenuItem, Select, InputLabel, FormControl, Typography, CircularProgress, LinearProgress } from '@mui/material';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

const validationSchemaSignUp = Yup.object({
  Name: Yup.string().required('Full name is required'),
  Phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  Section: Yup.string()
    .oneOf(['A', 'B', 'C', 'D', 'E', 'F', 'Not Applicable'], 'Invalid Section')
    .default('Not Applicable'),
  Roll_Number: Yup.string()
    .matches(
      /^(MBA\/09\/\d{3}|MBA\/BA03\/\d{3}|MBA\/HR03\/\d{3}|MBA\/10\/\d{3}|MBA\/BA04\/\d{3}|MBA\/HR04\/\d{3}|MSDSM\/01\/\d{3}|Not Applicable)$/,
      'Roll number must match MBA/___/___ formats'
    )
    .default('Not Applicable'),
  Hostel: Yup.string()
    .oneOf(['Metropolis', 'Park Inn', 'Blessings City', 'Not Applicable'], 'Invalid Hostel')
    .default('Not Applicable'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  userType: Yup.string()
    .required('User Category is required')
    .oneOf(['Titans', 'Nyxen', 'MSDSM', 'PhD', 'Staffs/Faculty'], 'Invalid user category'),
});

const validationSchemaLogin = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const DataForm = () => {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleModeSwitch = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setAlertMessage(null);
  };

  const postToServerApi = async (values, resetForm) => {
    setLoading(true);
    try {
      const endpoint = isLoginMode ? '/api/login' : '/api/register';
      const response = await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, {
        ...values,
        Section: values.Section || 'Not Applicable',
        Hostel: values.Hostel || 'Not Applicable',
        Roll_Number: values.Roll_Number || 'Not Applicable',
      });

      if (isLoginMode) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        navigate('/cart');
      } else {
        setAlertMessage({ severity: 'success', text: 'Registration successful! Please log in.' });
        handleModeSwitch();
        resetForm();
      }
    } catch (error) {
      console.error('Error:', error.message);
      setAlertMessage({
        severity: 'error',
        text: error.response?.data?.error || 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const hostels = [
    { value: 'Metropolis', label: 'Metropolis' },
    { value: 'Park Inn', label: 'Park Inn' },
    { value: 'Blessings City', label: 'Blessings City' },
    { value: 'Not Applicable', label: 'Not Applicable' },
  ];

  const userTypes = [
    { value: 'Titans', label: 'Titans' },
    { value: 'Nyxen', label: 'Nyxen' },
    { value: 'MSDSM', label: 'MSDSM' },
    { value: 'PhD', label: 'PhD' },
    { value: 'Staffs/Faculty', label: 'Staffs/Faculty' },
  ];

  return (
    <>
      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="calc(100vh - 144px)">
          <LinearProgress color="secondary" sx={{ width: '50%' }} />
          <Typography textAlign="center" sx={{ mt: 2, fontWeight: 200, letterSpacing: 1.4, color: 'grey', fontFamily: 'Anton, Source Code Pro' }}>
            Processing your request, please wait...
          </Typography>
        </Box>
      )}
      {!loading && (
        <Formik
          initialValues={{
            Name: '',
            Phone: '',
            Section: '',
            Roll_Number: '',
            Hostel: '',
            email: '',
            password: '',
            confirmPassword: '',
            userType: '',
          }}
          validationSchema={isLoginMode ? validationSchemaLogin : validationSchemaSignUp}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            postToServerApi(values, resetForm);
            setSubmitting(false);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" gap={2}>
                {!isLoginMode && (
                  <>
                    <Field as={TextField} name="Name" label="Full Name" variant="outlined" error={touched.Name && Boolean(errors.Name)} helperText={touched.Name && errors.Name} />

                    {/* User Type Dropdown */}
                    <FormControl variant="outlined" error={touched.userType && Boolean(errors.userType)}>
                      <InputLabel>User Category</InputLabel>
                      <Select
                        name="userType"
                        value={values.userType}
                        onChange={(e) => {
                          handleChange(e);
                          const userTypeValue = e.target.value;
                          if (userTypeValue === 'Staffs/Faculty') {
                            setFieldValue('Section', 'Not Applicable');
                            setFieldValue('Hostel', 'Not Applicable');
                            setFieldValue('Roll_Number', 'Not Applicable');
                          }
                        }}
                        onBlur={handleBlur}
                      >
                        {userTypes.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.userType && <Typography color="error">{errors.userType}</Typography>}
                    </FormControl>

                    <Field as={TextField} name="Phone" label="Phone Number" variant="outlined" error={touched.Phone && Boolean(errors.Phone)} helperText={touched.Phone && errors.Phone} />

                    <FormControl variant="outlined" error={touched.Section && Boolean(errors.Section)} disabled={values.userType === 'Staffs/Faculty'}>
                      <InputLabel>Section</InputLabel>
                      <Select
                        name="Section"
                        value={values.Section}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        {['A', 'B', 'C', 'D', 'E', 'F', 'Not Applicable'].map((section) => (
                          <MenuItem key={section} value={section}>
                            {section}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.Section && <Typography color="error">{errors.Section}</Typography>}
                    </FormControl>

                    <Field
                      as={TextField}
                      name="Roll_Number"
                      label="Roll Number"
                      variant="outlined"
                      error={touched.Roll_Number && Boolean(errors.Roll_Number)}
                      helperText={touched.Roll_Number && errors.Roll_Number}
                      disabled={values.userType === 'Staffs/Faculty'}
                    />

                    <FormControl variant="outlined" error={touched.Hostel && Boolean(errors.Hostel)} disabled={values.userType === 'Staffs/Faculty'}>
                      <InputLabel>Hostel</InputLabel>
                      <Select
                        name="Hostel"
                        value={values.Hostel}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        {hostels.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.Hostel && <Typography color="error">{errors.Hostel}</Typography>}
                    </FormControl>
                  </>
                )}
                <Field as={TextField} name="email" label="Email" variant="outlined" error={touched.email && Boolean(errors.email)} helperText={touched.email && errors.email} />
                <Field as={TextField} name="password" label="Password" variant="outlined" type={showPassword ? 'text' : 'password'} error={touched.password && Boolean(errors.password)} helperText={touched.password && errors.password}
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
                {!isLoginMode && (
                  <Field as={TextField} name="confirmPassword" label="Confirm Password" variant="outlined" type={showConfirmPassword ? 'text' : 'password'} error={touched.confirmPassword && Boolean(errors.confirmPassword)} helperText={touched.confirmPassword && errors.confirmPassword}
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
                )}
                <Button type="submit" color="primary" variant="contained" sx={{ bgcolor: "#000" }} disabled={loading}>
                  {isLoginMode ? 'Login' : 'Sign Up'}
                </Button>
                <Button onClick={handleModeSwitch}>
                  {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                </Button>
                {alertMessage && <Alert severity={alertMessage.severity}>{alertMessage.text}</Alert>}
                <Backdrop sx={{ color: '#fff' }} open={loading}>
                  <CircularProgress color="inherit" />
                </Backdrop>
              </Box>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default DataForm;