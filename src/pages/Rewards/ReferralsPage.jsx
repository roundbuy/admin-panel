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
    IconButton,
    Tooltip,
    Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from '../../services/api'; // Ensure this path is correct
import { toast } from 'react-toastify';

const ReferralsPage = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            // Placeholder: Fetch all referrals. 
            // Needs a dedicated admin endpoint like /api/v1/admin/rewards/referrals
            // For now, empty or mock
            const response = await axios.get('/mobile-app/rewards/referrals'); // This is user specific, won't work for admin list. 
            // Just empty for now to show structure
            setReferrals([]);
        } catch (error) {
            console.error('Error fetching referrals:', error);
            // toast.error('Failed to load referrals');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Referrals</Typography>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchReferrals}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Referrer</TableCell>
                                    <TableCell>Referee</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {referrals.map((referral) => (
                                    <TableRow key={referral.id}>
                                        <TableCell>{referral.id}</TableCell>
                                        <TableCell>{referral.referrer_name}</TableCell>
                                        <TableCell>{referral.referee_name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={referral.status}
                                                color={referral.status === 'completed' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                                {referrals.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No referrals found</TableCell>
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

export default ReferralsPage;
