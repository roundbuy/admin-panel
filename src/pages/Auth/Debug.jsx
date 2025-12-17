import React from 'react';
import { Box, Button, Card, CardContent, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Debug = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    let tokenPayload = null;
    let tokenExpired = false;

    if (token) {
        try {
            tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const expDate = new Date(tokenPayload.exp * 1000);
            tokenExpired = expDate < new Date();
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }

    const handleClearStorage = () => {
        localStorage.clear();
        alert('Storage cleared! Redirecting to login...');
        window.location.href = '/login';
    };

    return (
        <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Admin Panel Debug
            </Typography>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Authentication Status
                    </Typography>

                    {token ? (
                        <>
                            <Alert severity={tokenExpired ? 'error' : 'success'} sx={{ mb: 2 }}>
                                Token {tokenExpired ? 'EXPIRED' : 'EXISTS'}
                            </Alert>

                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Token:</strong> {token.substring(0, 50)}...
                            </Typography>

                            {tokenPayload && (
                                <>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>User ID:</strong> {tokenPayload.userId || tokenPayload.id}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Role:</strong> {tokenPayload.role}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Expires:</strong> {new Date(tokenPayload.exp * 1000).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Expired:</strong> {tokenExpired ? 'YES ❌' : 'NO ✅'}
                                    </Typography>
                                </>
                            )}
                        </>
                    ) : (
                        <Alert severity="warning">
                            No token found in localStorage
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        User Data
                    </Typography>

                    {user ? (
                        <pre style={{ overflow: 'auto', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                            {JSON.stringify(JSON.parse(user), null, 2)}
                        </pre>
                    ) : (
                        <Alert severity="warning">
                            No user data found in localStorage
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Actions
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleClearStorage}
                        >
                            Clear Storage & Go to Login
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => navigate('/dashboard')}
                        >
                            Go to Dashboard
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Diagnosis
                    </Typography>

                    {!token && (
                        <Alert severity="info">
                            ✅ No token - Login page should work fine
                        </Alert>
                    )}

                    {token && !tokenExpired && (
                        <Alert severity="success">
                            ✅ Valid token - Dashboard should work
                        </Alert>
                    )}

                    {token && tokenExpired && (
                        <Alert severity="error">
                            ❌ Token expired - This causes redirect loop!
                            <br />
                            Click "Clear Storage & Go to Login" to fix.
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Debug;
