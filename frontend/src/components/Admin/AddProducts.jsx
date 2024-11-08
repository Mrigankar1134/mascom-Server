import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, FormControlLabel, Checkbox,
  Radio, RadioGroup, Paper, IconButton, LinearProgress, List, ListItem, ListItemText, ListItemSecondaryAction, Snackbar, Alert, FormGroup,
  Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const AddProduct = () => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    customizable_name: false,
    size_available: false,
    color_available: false,
    available_for: [], // Initialize available_for as an array
  });

  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const availabilityOptions = ['Titans', 'Nyxen', 'PhD', 'MSDSM', 'Staffs/Faculty']; // Define available options

  // Function to show alerts
  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  // Dropzone configuration for image uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/webp',
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        name: file.name,
        progress: 0,
      }));
      setImages((prev) => [...prev, ...newFiles]);
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData({
      ...productData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value === 'true'
    });
  };

  const handleAddSize = () => {
    setSizes([...sizes, '']);
  };

  const handleSizeChange = (index, value) => {
    const newSizes = [...sizes];
    newSizes[index] = value;
    setSizes(newSizes);
  };

  const handleAddColor = () => {
    setColors([...colors, '']);
  };

  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const handleDeleteImage = (fileName) => {
    setImages(images.filter((image) => image.name !== fileName));
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
  };

  const handleAvailabilityChange = (event) => {
    const { value, checked } = event.target;
    setProductData((prevData) => ({
      ...prevData,
      available_for: checked
        ? [...prevData.available_for, value] // Add if checked
        : prevData.available_for.filter((item) => item !== value), // Remove if unchecked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productData.size_available && sizes.filter(size => size.trim() !== '').length === 0) {
      showAlert("Please add at least one size.", "warning");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      // Append main product data to formData
      for (const key in productData) {
        if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key])); // Stringify arrays for backend
        } else {
          formData.append(key, productData[key]);
        }
      }

      // Append images to formData
      images.forEach((image) => {
        formData.append('images', image.file);
      });

      // Send product data and images
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/products`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const productId = response.data.productId;

      // Add sizes and colors if available
      const filteredSizes = sizes.filter(size => size.trim() !== '');
      const filteredColors = colors.filter(color => color.trim() !== '');

      if (productData.size_available && filteredSizes.length) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/products/${productId}/sizes`, { sizes: filteredSizes }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (productData.color_available && filteredColors.length) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/products/${productId}/colors`, { colors: filteredColors }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      showAlert('Product added successfully', 'success');
      setProductData({
        name: '',
        description: '',
        price: '',
        category: '',
        customizable_name: false,
        size_available: false,
        color_available: false,
        available_for: [],
      });
      setSizes([]);
      setColors([]);
      setImages([]);
    } catch (error) {
      console.error('Error adding product:', error);
      showAlert('Failed to add product', 'error');
    }
  };

  return (
    <Paper sx={{ padding: 4, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h4" gutterBottom>Add New Product</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
        
        <TextField label="Product Name" name="name" value={productData.name} onChange={handleInputChange} required />
        <TextField label="Description" name="description" value={productData.description} onChange={handleInputChange} multiline rows={4} />
        <TextField label="Price" name="price" type="number" value={productData.price} onChange={handleInputChange} required />

        {/* Category Dropdown */}
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            name="category"
            value={productData.category}
            onChange={handleInputChange}
          >
            <MenuItem value="Clothing">Clothing</MenuItem>
            <MenuItem value="Accessories">Accessories</MenuItem>
            <MenuItem value="Stationery">Stationery</MenuItem>
            <MenuItem value="Drinkware">Drinkware</MenuItem>
            <MenuItem value="Tech Accessories">Tech Accessories</MenuItem>
            <MenuItem value="Sports Gear">Sports Gear</MenuItem>
            <MenuItem value="Room Decor">Room Decor</MenuItem>
            <MenuItem value="Event-Specific Items">Event-Specific Items</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel control={<Checkbox checked={productData.customizable_name} onChange={handleInputChange} name="customizable_name" />} label="Customizable Name" />

        {/* Availability Section */}
        <Typography variant="h6" gutterBottom>Available For</Typography>
        <FormGroup row>
          {availabilityOptions.map((option) => (
            <FormControlLabel
              key={option}
              control={
                <Checkbox
                  value={option}
                  checked={productData.available_for.includes(option)}
                  onChange={handleAvailabilityChange}
                />
              }
              label={option}
            />
          ))}
        </FormGroup>

        {/* Image Upload Section */}
        <Box 
  {...getRootProps()} 
  sx={{ 
    p: 3, 
    border: '2px dashed #90caf9', 
    borderRadius: '8px', 
    textAlign: 'center', 
    cursor: 'pointer', 
    mb: 2 
  }}
>
  <input {...getInputProps()} />
  <UploadIcon color="primary" sx={{ fontSize: 40 }} />
  <Typography>Drag & Drop or Click to Upload Images</Typography>
  
  {/* Message about 1:1 aspect ratio requirement */}
  <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
    Please upload images with a 1:1 aspect ratio only.
  </Typography>
</Box>
        
        <List>
          {images.map((file) => (
            <ListItem key={file.name} sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageIcon sx={{ color: '#1976d2', mr: 2 }} />
              <ListItemText primary={file.name} />
              {uploadProgress[file.name] !== undefined && (
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  {uploadProgress[file.name] === 'error' ? (
                    <Typography color="error">Upload failed</Typography>
                  ) : (
                    <LinearProgress variant="determinate" value={uploadProgress[file.name]} />
                  )}
                </Box>
              )}
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDeleteImage(file.name)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {/* Size Availability */}
        <Paper elevation={2} sx={{ padding: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Is Size Available?</Typography>
          <RadioGroup
            row
            name="size_available"
            value={String(productData.size_available)}
            onChange={handleRadioChange}
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>

          {productData.size_available && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Add Sizes:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sizes.map((size, index) => (
                  <TextField key={index} label={`Size ${index + 1}`} value={size} onChange={(e) => handleSizeChange(index, e.target.value)} sx={{ width: '150px' }} />
                ))}
                <Button onClick={handleAddSize} color="primary" startIcon={<AddIcon />}>Add Size</Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Color Availability */}
        <Paper elevation={2} sx={{ padding: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Is Color Available?</Typography>
          <RadioGroup
            row
            name="color_available"
            value={String(productData.color_available)}
            onChange={handleRadioChange}
          >
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>

          {productData.color_available && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Add Colors:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {colors.map((color, index) => (
                  <TextField key={index} label={`Color ${index + 1}`} value={color} onChange={(e) => handleColorChange(index, e.target.value)} sx={{ width: '150px' }} />
                ))}
                <Button onClick={handleAddColor} color="primary" startIcon={<AddIcon />}>Add Color</Button>
              </Box>
            </Box>
          )}
        </Paper>

        <Button sx={{ bgcolor: "#000000", '&:hover': { backgroundColor: '#333333' }, mt: 3 }} variant="contained" type="submit">Add Product</Button>
      </Box>

      {/* Snackbar for alerts */}
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddProduct;