import React, { useState } from 'react';
import { TextField, Button, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { CognitoIdentityProviderClient, ForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { toast } from 'react-toastify';
import { config } from '../aws-config';
import ForgotPasswordVerification from './ForgotPasswordVerification';

const client = new CognitoIdentityProviderClient({ region: config.region });

const ForgotPassword = ({ dialogOpen, handleDialogClose }) => {
    const [loading, setLoading] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [dialogError, setDialogError] = useState('');

    const resetDialog = () => {
        setForgotPasswordEmail('');
        setDialogError('');
    };

    const handleForgotPassword = async () => {
        if (!forgotPasswordEmail) {
            setDialogError('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
            setDialogError('Invalid email format');
            return;
        }
        setLoading(true);
        setDialogError('');
        try {
            const command = new ForgotPasswordCommand({
                ClientId: config.clientId,
                Username: forgotPasswordEmail,
            });
            await client.send(command);
            toast.success('Password reset code sent to your email.');
            handleDialogClose();
            handleOpenVerificationDialog();
        } catch (error) {
            setDialogError(error.message.includes('User not found') ? 'Account with this email does not exist' : error.message);
        }
        setLoading(false);
    };

    const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

    const handleOpenVerificationDialog = () => {
        setVerificationDialogOpen(true);
    };

    const handleCloseVerificationDialog = () => {
        setVerificationDialogOpen(false);
        resetDialog();
    };

    return (
        <>
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogContent>
                    <TextField
                        name="forgotPasswordEmail"
                        label="Email"
                        variant="outlined"
                        fullWidth
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button onClick={handleForgotPassword} color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Send Reset Code'}
                    </Button>
                </DialogActions>
            </Dialog>

            <ForgotPasswordVerification
                dialogOpen={verificationDialogOpen}
                handleDialogClose={handleCloseVerificationDialog}
                email={forgotPasswordEmail}
            />
        </>
    );
};

export default ForgotPassword;