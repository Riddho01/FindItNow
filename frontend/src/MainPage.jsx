import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import {
    Container,
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardMedia,
    Paper,
    IconButton,
    styled,
    Tooltip,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link } from 'react-router-dom';

const BASE_URL=import.meta.env.VITE_BASE_URL;
const BUCKET_NAME=import.meta.env.VITE_BUCKET_NAME

const GradientPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    background: 'linear-gradient(135deg, #6e45e2 0%, #88d3ce 100%)',
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
    boxShadow: theme.shadows[4],
    border: '1px solid transparent',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    '&:hover': {
        backgroundColor: '#ffffff1a',
        borderColor: theme.palette.primary.light,
    },
}));

const UploadButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    '&:active': {
        transform: 'scale(0.95)',
    },
}));

const AdminButton = styled(Button)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    padding: theme.spacing(1, 3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    '&:active': {
        transform: 'scale(0.95)',
    },
}));

const MainPage = () => {
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = useCallback((file) => {
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
            setImage(file);
            setError('');
        } else {
            setError('Please upload a valid image file (PNG or JPEG).');
            setImage(null);
        }
    }, []);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        handleImageUpload(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        handleImageUpload(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleSearch = async () => {
        if (!image) {
            setError('No image uploaded.');
            return;
        }

        setLoading(true);
        setError('');
        setMatches([]);

        try {
            const formData = new FormData();
            formData.append('file', image);

            const response = await axios.post(`${BASE_URL}/search-item`, formData.get('file'), {
                headers: {
                    'Content-Type': image.type,
                },
                responseType: 'json'
            });

            if (response.data && response.data.length > 0) {
                setMatches(response.data);
            } else {
                setError('No such object found.');
            }
        } catch (error) {
            console.error('Error during search:', error);
            setError('An error occurred during the search.');
        }

        setLoading(false);
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Container sx={{ pb: 5 }}>
            <Box sx={{ textAlign: 'center', mt: 5, mb: 5, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <img 
                        src="/finditnow-high-resolution-logo-transparent.png" 
                        alt="FindItNow Logo" 
                        style={{ maxWidth: '90%', height: 'auto', maxHeight: '200px' }} 
                    />
                </Box>
                <Typography variant="h6" sx={{ mb: 3 }}>
                    Welcome to FindItNow, your trusted Lost and Found solution. Simply upload an image of your lost item, and we'll search our database to help you find a match.
                </Typography>
                <GradientPaper
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    <Box sx={{ mb: 3 }}>
                        <input
                            accept="image/png, image/jpeg"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            type="file"
                            onChange={handleFileSelect}
                            ref={fileInputRef}
                        />
                        <label htmlFor="raised-button-file">
                            <UploadButton component="span">
                                <UploadIcon fontSize="large" />
                            </UploadButton>
                        </label>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            {image ? `File Uploaded: ${image.name}` : 'No file chosen'}
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="secondary" /> : 'Search'}
                        </Button>
                    </Box>
                </GradientPaper>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Box sx={{ position: 'absolute', top: 0, right: 0, m: 2 }}>
                    <Tooltip title="Admin Panel">
                        <AdminButton
                            variant="contained"
                            color="primary"
                            component={Link}
                            to="/authentication"
                            startIcon={<AdminPanelSettingsIcon />}
                        >
                            Admin
                        </AdminButton>
                    </Tooltip>
                </Box>
            </Box>
            {matches.length > 0 && (
                <Box sx={{ mt: 5, pb: 5 }}>
                    <Typography variant="h5" gutterBottom>
                        Matched Items: {matches.length}
                    </Typography>
                    <Grid container spacing={3}>
                        {matches.map((match, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card>
                                    <CardMedia
                                        component="img"
                                        image={`https://${[BUCKET_NAME]}.s3.amazonaws.com/${match.Image}`}
                                        alt={`Match ${index + 1}`}
                                        sx={{ height: 300, objectFit: 'cover' }}
                                    />
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
};

export default MainPage;