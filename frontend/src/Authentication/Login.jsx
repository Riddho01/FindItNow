import React, { useState } from 'react';
import { TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { config } from '../aws-config';
import ForgotPassword from './ForgotPassword';
import { useAuth } from './AuthContext';

const client = new CognitoIdentityProviderClient({ region: config.region });

const Login = () => {
    const { login } = useAuth(); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignIn = async () => {
        const { email, password } = formData;
        if (!email || !password) {
            setError('Email and Password are required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email format');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const command = new InitiateAuthCommand({
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: config.clientId,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password,
                },
            });
            const response = await client.send(command);
            const token = response.AuthenticationResult.IdToken;
            toast.success('Sign-in successful!');
            setFormData({ email: '', password: '' });
            login(token);
        } catch (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    const handleForgotPasswordClick = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <>
            <ToastContainer />
            <Typography variant="h4" sx={{ mb: 3 }}>Sign In</Typography>
            <TextField
                name="email"
                label="Email"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={formData.email}
                onChange={handleChange}
            />
            <TextField
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={formData.password}
                onChange={handleChange}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
                onClick={handleSignIn}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Button
                variant="text"
                color="secondary"
                fullWidth
                onClick={handleForgotPasswordClick}
            >
                Forgot Password?
            </Button>
            <ForgotPassword dialogOpen={dialogOpen} handleDialogClose={handleDialogClose} />
        </>
    );
};

export default Login;