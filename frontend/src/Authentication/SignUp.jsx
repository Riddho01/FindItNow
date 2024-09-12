import React, { useState } from 'react';
import { TextField, Button, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { config } from '../aws-config';
import axios from 'axios';
import AccessCode from './AccessCode';

const client = new CognitoIdentityProviderClient({ region: config.region });
const BASE_URL=import.meta.env.VITE_BASE_URL;

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [accessCodeVerified, setAccessCodeVerified] = useState(false);
    const [accessCodePopupOpen, setAccessCodePopupOpen] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        organization: '',
        password: '',
        confirmPassword: '',
    });

    const clearFields = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            organization: '',
            password: '',
            confirmPassword: '',
        });
    };

    const validateSignUp = () => {
        const { firstName, lastName, email, organization, password, confirmPassword } = formData;
        if (!firstName || !lastName || !email || !organization || !password || !confirmPassword) {
            setError('All fields are required');
            setSnackbarOpen(true);
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email format');
            setSnackbarOpen(true);
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setSnackbarOpen(true);
            return false;
        }
        return true;
    };

    const updateAccessCodeStatus = async (code) => {
        try {
            // const response = await axios.put('https://lc65zuilq5.execute-api.us-east-1.amazonaws.com/DEV/user/admin/verification-code', { "code": code });
            const response = await axios.put(`${BASE_URL}/user/admin/verification-code`, { "code": code });
            console.log(response.data);
        } catch (error) {
            console.error('Failed to update access code status', error);
        }
    };

    const handleSignUp = async () => {
        if (!validateSignUp()) return;
        setLoading(true);
        setError('');
        const { firstName, lastName, email, organization, password } = formData;

        try {
            const command = new SignUpCommand({
                ClientId: config.clientId,
                Username: email,
                Password: password,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'custom:organization', Value: organization },
                    { Name: 'given_name', Value: firstName },
                    { Name: 'family_name', Value: lastName },
                ],
            });
            await client.send(command);
            toast.success('Sign-up successful! Please check your email for a verification code.');

            await updateAccessCodeStatus(accessCode);

            clearFields();
            setAccessCodeVerified(false);
            setAccessCodePopupOpen(true);
        } catch (error) {
            setError(error.message);
            setSnackbarOpen(true);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <>
            <AccessCode
                open={accessCodePopupOpen}
                onClose={() => setAccessCodePopupOpen(false)}
                onAccessCodeVerified={(code) => {
                    setAccessCode(code);
                    setAccessCodeVerified(true);
                    setAccessCodePopupOpen(false);
                }}
            />
            {accessCodeVerified ? (
                <>
                    <ToastContainer />
                    <Typography variant="h4" sx={{ mb: 3 }}>Sign Up</Typography>
                    <TextField
                        name="firstName"
                        label="First Name"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <TextField
                        name="lastName"
                        label="Last Name"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formData.lastName}
                        onChange={handleChange}
                    />
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
                        name="organization"
                        label="Organization"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formData.organization}
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
                    <TextField
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mb: 2 }}
                        onClick={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        message={error}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        action={
                            <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
                                Close
                            </Button>
                        }
                    />
                </>
            ) : (
                <Typography variant="h5" sx={{ mt: 3, textAlign: 'center' }}>
                    Please verify your access code to proceed with sign-up.
                </Typography>
            )}
        </>
    );
};

export default SignUp;