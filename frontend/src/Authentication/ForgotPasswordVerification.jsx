import React, { useState } from 'react';
import { TextField, Button, CircularProgress, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import { toast } from 'react-toastify';
import { config } from '../aws-config';

const client = new CognitoIdentityProviderClient({ region: config.region });

const ForgotPasswordVerification = ({ dialogOpen, handleDialogClose, email }) => {
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [dialogError, setDialogError] = useState('');

    const resetDialog = () => {
        setVerificationCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setDialogError('');
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            setDialogError('Verification code is required');
            return;
        }
        setDialogError('');
        setLoading(true);

        try {
            const command = new ConfirmForgotPasswordCommand({
                ClientId: config.clientId,
                Username: email,
                ConfirmationCode: verificationCode,
                Password: newPassword,
            });
            await client.send(command);
            toast.success('Password reset successful! You can now sign in with your new password.');
            handleDialogClose();
            resetDialog();
        } catch (error) {
            setDialogError(error.message);
        }
        setLoading(false);
    };

    const handleResetPassword = () => {
        if (!newPassword || !confirmNewPassword) {
            setDialogError('All password fields are required');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setDialogError('Passwords do not match');
            return;
        }
        setDialogError('');
        handleVerifyCode();
    };

    return (
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
            <DialogTitle>Verify Reset Code</DialogTitle>
            <DialogContent>
                <TextField
                    name="verificationCode"
                    label="Verification Code"
                    variant="outlined"
                    fullWidth
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    name="newPassword"
                    label="New Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    name="confirmNewPassword"
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    sx={{ mb: 2 }}
                />
                {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose}>Cancel</Button>
                <Button onClick={handleResetPassword} color="primary" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ForgotPasswordVerification;