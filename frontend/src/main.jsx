import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App'; 
import { AuthProvider } from './Authentication/AuthContext'; 

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#bb86fc',
        },
        background: {
            default: '#121212',
            paper: '#1d1d1d',
        },
        text: {
            primary: '#ffffff',
        },
    },
    typography: {
        fontFamily: 'Poppins, sans-serif',
    },
});

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
            <AuthProvider>
                <App />
            </AuthProvider>
        </Router>
    </ThemeProvider>,
    document.getElementById('root')
);