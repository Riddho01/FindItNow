import React, { useState } from 'react';
import { TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { config } from '../aws-config';

const client = new CognitoIdentityProviderClient({ region: config.region });

const VerifyEmail = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [emailForVerification, setEmailForVerification] = useState('');

    const handleVerifyEmail = async () => {
        if (!verificationCode || !emailForVerification) {
            setError('Email and Verification Code are required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(emailForVerification)) {
            setError('Invalid email format');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const command = new ConfirmSignUpCommand({
                ClientId: config.clientId,
                Username: emailForVerification,
                ConfirmationCode: verificationCode,
            });
            await client.send(command);
            toast.success('Email verification successful!');
            setVerificationCode('');
            setEmailForVerification('');
        } catch (error) {
            if (error.name === 'ExpiredCodeException') {
                setError('Verification code has expired. Please request a new one.');
            } else if (error.name === 'CodeMismatchException') {
                setError('Invalid verification code. Please try again.');
            } else if (error.name === 'NotAuthorizedException') {
                setError('This email is already verified.');
            } else {
                setError(error.message);
            }
        }
        setLoading(false);
    };

    return (
        <>
            <ToastContainer />
            <Typography variant="h4" sx={{ mb: 3 }}>Verify Email</Typography>
            <TextField
                name="emailForVerification"
                label="Email"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={emailForVerification}
                onChange={(e) => setEmailForVerification(e.target.value)}
            />
            <TextField
                name="verificationCode"
                label="Verification Code"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
                onClick={handleVerifyEmail}
                disabled={loading}
            >
                {loading ? <CircularProgress size={24} /> : 'Verify Email'}
            </Button>
        </>
    );
};

export default VerifyEmail;
