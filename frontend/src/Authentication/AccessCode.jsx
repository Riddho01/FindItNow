import React, { useState } from 'react';
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';
import axios from 'axios';

const BASE_URL=import.meta.env.VITE_BASE_URL;

const AccessCode = ({ open, onClose, onAccessCodeVerified }) => {
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');

    const handleAccessCodeChange = (e) => {
        setAccessCode(e.target.value);
    };

    const handleVerifyAccessCode = async () => {
        try {

            const response = await axios.post(`${BASE_URL}/user/admin/verification-code`, { code: accessCode });
            if (response.data.statusCode === 200) {
                onAccessCodeVerified(accessCode);
                onClose();
            } else {
                setError('Invalid access code');
            }
        } catch (error) {
            setError('Invalid access code');
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Enter Access Code</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Access Code"
                    type="text"
                    fullWidth
                    value={accessCode}
                    onChange={handleAccessCodeChange}
                />
                {error && <Alert severity="error">{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleVerifyAccessCode}>Verify</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AccessCode;