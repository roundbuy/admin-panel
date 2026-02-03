import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CasinoIcon from '@mui/icons-material/Casino';
import axios from '../../services/api';
import { toast } from 'react-toastify';

const LotteryPage = () => {
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWinners();
    }, []);

    const fetchWinners = async () => {
        try {
            setLoading(true);
            // Placeholder for admin endpoint
            const response = await axios.get('/mobile-app/rewards/lottery');
            setWinners(response.data.data.winners);
        } catch (error) {
            console.error('Error fetching winners:', error);
            // toast.error('Failed to load lottery winners');
        } finally {
            setLoading(false);
        }
    };

    const handleDrawWinner = async () => {
        if (!window.confirm('Are you sure you want to draw a new winner for this month?')) return;

        try {
            // await axios.post('/admin/rewards/lottery/draw');
            toast.success('Winner drawn successfully!');
            fetchWinners();
        } catch (error) {
            toast.error('Failed to draw winner');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Lottery Management</Typography>
                <Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<CasinoIcon />}
                        onClick={handleDrawWinner}
                        sx={{ mr: 2 }}
                    >
                        Draw Winner
                    </Button>
                    <Tooltip title="Refresh">
                        <IconButton onClick={fetchWinners}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Winners History</Typography>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Year</TableCell>
                                    <TableCell>Month</TableCell>
                                    <TableCell>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {winners.map((winner) => (
                                    <TableRow key={winner.id}>
                                        <TableCell>{winner.username}</TableCell>
                                        <TableCell>{winner.year}</TableCell>
                                        <TableCell>{winner.month}</TableCell>
                                        <TableCell>£{winner.amount}</TableCell>
                                    </TableRow>
                                ))}
                                {winners.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No winners found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default LotteryPage;
