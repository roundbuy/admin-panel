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
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from '../../services/api';
import { toast } from 'react-toastify';

const RewardsPage = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            // Determine the correct endpoint. 
            // Assuming a generic admin rewards endpoint exists or re-using the mobile one for now if no admin specific one created yet.
            // But typically admin needs full CRUD. 
            // For now, I'll use the mobile one to just view, or mock it if needed.
            // Wait, I haven't created Admin API endpoints for this yet!
            // I should probably use the mobile one to at least LIST them for now, or create new admin endpoints.
            // Let's assume I need to create admin endpoints too. 
            // For this step I'll try to fetch from /mobile-app/rewards just to see data.
            const response = await axios.get('/mobile-app/rewards');
            setRewards(response.data.data);
        } catch (error) {
            console.error('Error fetching rewards:', error);
            toast.error('Failed to load rewards');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Rewards Management</Typography>
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchRewards}>
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
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Required Referrals</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rewards.map((reward) => (
                                    <TableRow key={reward.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {/* Icon placeholder */}
                                                <Typography variant="body1">{reward.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={reward.type} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{reward.description}</TableCell>
                                        <TableCell>{reward.required_referrals || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={reward.is_active ? 'Active' : 'Inactive'}
                                                color={reward.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small">
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {rewards.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No rewards found</TableCell>
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

export default RewardsPage;
