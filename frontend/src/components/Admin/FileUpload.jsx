import React, { useState } from 'react';
import {
  Box, Typography, Button, LinearProgress, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import UploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';

const FileUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  // Configure dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/jpeg, image/png, image/webp',
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        name: file.name,
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
      
      // Immediately call uploadFile for each newly added file
      newFiles.forEach(uploadFile);
    },
  });

  // Function to upload a file to the server
  const uploadFile = (fileObj) => {
    const formData = new FormData();
    formData.append('file', fileObj.file);

    axios.post(`${process.env.REACT_APP_API_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        const progress = Math.round((100 * event.loaded) / event.total);
        setUploadProgress((prev) => ({
          ...prev,
          [fileObj.name]: progress,
        }));
      },
    }).then((response) => {
      setUploadProgress((prev) => ({
        ...prev,
        [fileObj.name]: 'Upload Successful',  // Display "Upload Successful"
      }));
      if (onUploadComplete) onUploadComplete(response.data.imageUrls || []); // Adjusted response to get URLs if provided
    }).catch(() => {
      setUploadProgress((prev) => ({
        ...prev,
        [fileObj.name]: 'Upload failed',  // Display "Upload failed"
      }));
    });
  };

  // Remove a file from the list
  const handleDelete = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
  };

  return (
    <Box sx={{ p: 4, border: '2px dashed #90caf9', borderRadius: '8px', textAlign: 'center' }}>
      <Box {...getRootProps()} sx={{ p: 3, cursor: 'pointer' }}>
        <input {...getInputProps()} />
        <UploadIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h6">Drag & Drop files here</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Browse
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          *File supported: .png, .jpg & .webp
        </Typography>
        {/* Add a prominent message about 1:1 aspect ratio */}
        <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
          Please upload images with a 1:1 aspect ratio only.
        </Typography>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'left' }}>
        <Typography variant="h6">Uploaded files</Typography>
        <List>
          {files.map((file) => (
            <ListItem key={file.name} sx={{ display: 'flex', alignItems: 'center' }}>
              <ImageIcon sx={{ color: '#1976d2', mr: 2 }} />
              <ListItemText primary={file.name} />
              {uploadProgress[file.name] !== undefined && (
                <Box sx={{ flexGrow: 1, mx: 2 }}>
                  {uploadProgress[file.name] === 'Upload failed' ? (
                    <Typography color="error">Upload failed</Typography>
                  ) : uploadProgress[file.name] === 'Upload Successful' ? (
                    <Typography color="primary">Upload Successful</Typography>
                  ) : (
                    <LinearProgress variant="determinate" value={uploadProgress[file.name]} />
                  )}
                </Box>
              )}
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(file.name)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default FileUpload;