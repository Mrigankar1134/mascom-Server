import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, CardActions, IconButton, Button, Chip, Box, TextField, Alert
} from '@mui/material';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';

const CardComponent = ({ p_id, p_img, p_name, p_price, size_available, color_available, description, customizable_name, setOpen, cart, setCart }) => {
  const [count, setCount] = useState(0);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState(size_available ? null : true); // Default to true if no size is required
  const [selectedColor, setSelectedColor] = useState(color_available ? null : true); // Default to true if no color is required
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customName, setCustomName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const sizeOrder = ["2XS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"]; // Define size order

    // Fetch sizes if available
    if (size_available) {
      axios.get(`http://localhost:6969/api/admin/products/${p_id}/sizes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const sortedSizes = response.data.sizes.sort((a, b) => {
          return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
        });
        setSizes(sortedSizes);
      })
      .catch((error) => console.error(`Error fetching sizes for product ${p_id}:`, error));
    } else {
      setSelectedSize(true); // Set to true if size is not required
    }

    // Fetch colors if available
    if (color_available) {
      axios.get(`http://localhost:6969/api/admin/products/${p_id}/colors`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const fetchedColors = response.data.colors;
        setColors(fetchedColors);
        if (fetchedColors.length === 0) {
          setSelectedColor(true); // Set to true if no colors are returned
        }
      })
      .catch((error) => console.error(`Error fetching colors for product ${p_id}:`, error));
    } else {
      setSelectedColor(true); // Set to true if color is not required
    }
  }, [p_id, size_available, color_available]);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + p_img.length) % p_img.length);
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % p_img.length);
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size === selectedSize ? null : size);
  };

  const handleColorClick = (color) => {
    setSelectedColor(color === selectedColor ? null : color);
  };

  const handleCustomNameChange = (event) => {
    const name = event.target.value;
    if (name.length <= 10) {
      setCustomName(name);
      setNameError(false);
    } else {
      setNameError(true);
    }
  };

  const handleAddToCart = () => {
    if (Array.isArray(cart) && cart.length === 1 && typeof cart[0] === 'object' && Object.keys(cart[0]).length === 0) {
      cart.length = 0;
    }
    setCart((prevItems) => {
      const itemIndex = prevItems.findIndex(item => item.p_id === p_id && item.p_size === selectedSize && item.p_color === selectedColor);
      if (itemIndex !== -1) {
        const newItems = [...prevItems];
        newItems[itemIndex].p_count += count;
        return newItems;
      } else {
        const newItem = {
          p_id: p_id,
          p_name: p_name,
          p_price: p_price,
          p_img: p_img,
          p_count: count,
          p_size: selectedSize,
          custom_name: customName,
        };
        if (color_available && selectedColor !== true) {
          newItem.p_color = selectedColor;
        }
        return [...prevItems, newItem];
      }
    });
  };

  // Check if button should be enabled
  useEffect(() => {
    const isSizeSelected = size_available ? selectedSize !== null : true;
    const isColorSelected = color_available ? selectedColor !== null : true;
    const isCustomNameFilled = customizable_name ? customName.trim() !== '' : true;
    const isCountValid = count > 0;

    const newButtonState = isSizeSelected && isColorSelected && isCustomNameFilled && isCountValid;
    setIsButtonEnabled(newButtonState);

  }, [count, selectedSize, selectedColor, customName, size_available, color_available, customizable_name]);

  return (
    <Card sx={{
      maxWidth: 500,
      margin: 2,
      borderRadius: '20px',
      marginBottom: '30px',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
    }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        <IconButton onClick={handlePrevClick} style={{ position: "absolute", left: 0 }}>
          <ArrowBackIosIcon />
        </IconButton>
        <Box
          component="img"
          src={p_img[currentIndex]}
          alt={`${p_name} image ${currentIndex + 1}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '20px 20px 0 0'
          }}
        />
        <IconButton onClick={handleNextClick} style={{ position: "absolute", right: 0 }}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      <CardContent sx={{ padding: '20px', paddingTop: '0' }}>
        <Typography component="div" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{p_name}</Typography>
        <Typography variant="h6" component="div" sx={{ margin: '10px 0' }}><b>Rs.&nbsp;{p_price}</b></Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: '10px' }}>{description}</Typography>

        {/* Custom Name Input */}
        {customizable_name && (
          <Box sx={{ marginTop: '15px' }}>
            <Typography variant="subtitle1">Enter Custom Name</Typography>
            <TextField
              value={customName}
              onChange={handleCustomNameChange}
              placeholder="Max 10 characters"
              variant="outlined"
              fullWidth
              inputProps={{ maxLength: 10 }}
            />
            {nameError && <Alert severity="warning">Name cannot exceed 10 characters.</Alert>}
          </Box>
        )}

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <Typography variant="subtitle1">Select Size</Typography>
            {sizes.map((size, index) => (
              <Chip
                key={index}
                label={size}
                sx={{
                  margin: 0.5,
                  backgroundColor: selectedSize === size ? "black" : '#ececec',
                  color: selectedSize === size ? "white" : 'grey',
                  borderColor: selectedSize === size ? "black" : '#ececec',
                  borderWidth: selectedSize === size ? 2 : 1,
                  borderStyle: "solid",
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  ...(selectedSize !== size && {
                    "&:hover": { borderColor: "grey", transform: 'scale(1.05)' },
                  }),
                  ...(selectedSize === size && {
                    "&:hover": { backgroundColor: 'black !important' },
                  }),
                }}
                onClick={() => handleSizeClick(size)}
                variant="filled"
              />
            ))}
          </div>
        )}

        {/* Color Selection */}
        {colors.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <Typography variant="subtitle1">Select Colour</Typography>
            {colors.map((color, index) => (
              <Chip
                key={index}
                label={color}
                sx={{
                  margin: 0.5,
                  backgroundColor: selectedColor === color ? "black" : '#ececec',
                  color: selectedColor === color ? "white" : 'grey',
                  borderColor: selectedColor === color ? "black" : '#ececec',
                  borderWidth: selectedColor === color ? 2 : 1,
                  borderStyle: "solid",
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  ...(selectedColor !== color && {
                    "&:hover": { borderColor: "grey", transform: 'scale(1.05)' },
                  }),
                  ...(selectedColor === color && {
                    "&:hover": { backgroundColor: 'black !important' },
                  }),
                }}
                onClick={() => handleColorClick(color)}
                variant="filled"
              />
            ))}
          </div>
        )}
      </CardContent>

      <CardActions sx={{ padding: '10px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box display="flex" alignItems="center">
            <IconButton disabled={count === 0} onClick={() => setCount(count - 1)}>
              <RemoveCircleOutlineOutlinedIcon />
            </IconButton>
            <Typography sx={{ marginLeft: 2, marginRight: 2 }}><b>{count}</b></Typography>
            <IconButton onClick={() => setCount(count + 1)}>
              <AddCircleOutlineOutlinedIcon />
            </IconButton>
          </Box>

          <Button
            variant="contained"
            sx={{ bgcolor: "#000000", color: "#ffffff", padding: '10px 20px', borderRadius: '20px' }}
            onClick={() => {
              if (count !== 0 && selectedSize && selectedColor && (!customizable_name || customName)) {
                setCount(0);
                handleAddToCart();
              } else {
                setOpen(true);
              }
            }}
            disabled={!isButtonEnabled}
          >
            Add&nbsp;to&nbsp;Cart
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default CardComponent;