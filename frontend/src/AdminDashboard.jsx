import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Input
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from './Authentication/AuthContext';
import { useNavigate } from 'react-router-dom';


const BASE_URL=import.meta.env.VITE_BASE_URL;
const BUCKET_NAME=import.meta.env.VITE_BUCKET_NAME

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { logout } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/found-items`);
      const body = JSON.parse(response.data.body);
      setItems(body);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items');
    }
    setLoading(false);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFilename(event.target.files[0]?.name.split('.')[0] || '');
  };

  const handleUploadClick = () => {
    setDialogOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const extension = file.name.split('.').pop();
    const validExtensions = ['jpg', 'jpeg', 'png'];

    if (!validExtensions.includes(extension)) {
      setError('Invalid file extension. Please upload a .jpg, .jpeg, or .png file.');
      return;
    }

    const filenameWithExt = filename.includes('.') ? filename : `${filename}.${extension}`;

    if (items.includes(filenameWithExt)) {
      setError('Filename already exists. Please choose a unique name.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await axios.put(
        `${BASE_URL}/${BUCKET_NAME}/${filenameWithExt}`,
        file,
        {
          headers: { 'Content-Type': file.type },
        }
      );
      setFile(null);
      setFilename('');
      fetchItems();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file');
    }
    setUploading(false);
    setDialogOpen(false);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.post(
        `${BASE_URL}/delete-item`,
        {
          bucket: `${BUCKET_NAME}`,
          key: selectedItem,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      fetchItems(); 
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item');
    }
    setConfirmDialogOpen(false);
    setSelectedItem(null);
  };

  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false);
    handleLogout();
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
        <Typography variant="h4">Admin Dashboard - Found Items</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogoutClick}
          startIcon={<LogoutIcon />}
          sx={{ py: 1.5, px: 3 }}
        >
          Logout
        </Button>
      </Box>
      
      <Box sx={{ textAlign: 'center', mt: 5, mb: 5 }}>
        <Button
          variant="contained"
          onClick={handleUploadClick}
          disabled={uploading}
          startIcon={<UploadIcon />}
          sx={{ py: 1.5, px: 3 }}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload File'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5, color: 'grey' }}>
          <Typography variant="h6">No found items at present.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  image={`https://${BUCKET_NAME}.s3.amazonaws.com/${item}`}
                  alt={`Item ${index + 1}`}
                  sx={{ height: 300, objectFit: 'cover' }}
                />
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body1">{item}</Typography>
                  <IconButton onClick={() => handleDeleteClick(item)} sx={{ mt: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <Input
            accept="image/*"
            id="file-input"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input">
            <Button variant="contained" component="span" disabled={uploading}>
              Choose File
            </Button>
          </label>
          <TextField
            autoFocus
            margin="dense"
            id="filename"
            label="Filename (without extension)"
            type="text"
            fullWidth
            variant="outlined"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            error={error.includes('Filename') || error.includes('Invalid')}
            helperText={error.includes('Filename') || error.includes('Invalid') ? error : ''}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpload}>Upload</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmLogout} color="primary" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;