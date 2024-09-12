import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, IconButton, Typography, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import VerifyEmail from './VerifyEmail';

const Authentication = () => {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5, mb: 5 }}>
                <IconButton onClick={handleHomeClick} sx={{ mr: 2 }}>
                    <HomeIcon fontSize="large" />
                </IconButton>
                <Typography variant="h4" sx={{ flexGrow: 1, textAlign: 'center' }}>
                    Admin Access Portal
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 5, mb: 5 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="Login" />
                    <Tab label="Sign Up" />
                    <Tab label="Verify Email" />
                </Tabs>
            </Box>
            <Box sx={{ mt: 2 }}>
                {activeTab === 0 && <Login />}
                {activeTab === 1 && <SignUp />}
                {activeTab === 2 && <VerifyEmail />}
            </Box>
            <Paper elevation={3} sx={{ p: 3, mt: 5, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    Welcome to the Admin Access Portal
                </Typography>
                <Typography variant="body1">
                    Please use the tabs above to login, sign up, or verify your email.
                    If you are a new admin, use the "Sign Up" tab to create your account.
                    Once you have signed up, use the "Verify Email" tab to verify your email address.
                    If you already have an account, simply use the "Login" tab to access your admin dashboard.
                </Typography>
            </Paper>
        </Container>
    );
};

export default Authentication;