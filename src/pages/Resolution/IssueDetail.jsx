import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Chip,
    Divider,
    Card,
    CardContent,
    Avatar,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Person as PersonIcon,
    ShoppingBag as AdIcon,
    Message as MessageIcon,
    Schedule as ExtendIcon,
    CheckCircle as AcceptIcon,
    Cancel as RejectIcon,
    Close as CloseIcon,
    Note as NoteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/Common/StatusBadge';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import adminService from '../../services/admin.service';

const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [formData, setFormData] = useState({
        days: 3,
        note: '',
        reason: '',
    });

    useEffect(() => {
        fetchIssueDetail();
    }, [id]);

    const fetchIssueDetail = async () => {
        try {
            setLoading(true);
            const response = await adminService.getIssueDetail(id);
            setIssue(response.data.data);
        } catch (error) {
            console.error('Failed to fetch issue details:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch issue details');
        } finally {
            setLoading(false);
        }
    };

    const handleExtendDeadline = async () => {
        try {
            await adminService.extendIssueDeadline(id, formData.days);
            toast.success('Deadline extended successfully');
            setExtendDialogOpen(false);
            fetchIssueDetail();
        } catch (error) {
            console.error('Extend deadline error:', error);
            toast.error(error.response?.data?.message || 'Failed to extend deadline');
        }
    };

    const handleAddNote = async () => {
        try {
            if (!formData.note.trim()) {
                toast.error('Note is required');
                return;
            }
            await adminService.addIssueNote(id, formData.note);
            toast.success('Note added successfully');
            setNoteDialogOpen(false);
            setFormData({ ...formData, note: '' });
            fetchIssueDetail();
        } catch (error) {
            console.error('Add note error:', error);
            toast.error(error.response?.data?.message || 'Failed to add note');
        }
    };

    const handleAction = async () => {
        try {
            switch (actionType) {
                case 'accept':
                    await adminService.forceAcceptIssue(id, formData.reason);
                    toast.success('Issue force-accepted successfully');
                    break;
                case 'reject':
                    await adminService.forceRejectIssue(id, formData.reason);
                    toast.success('Issue force-rejected successfully');
                    break;
                case 'close':
                    await adminService.closeIssue(id, formData.reason);
                    toast.success('Issue closed successfully');
                    break;
                default:
                    break;
            }
            setActionDialogOpen(false);
            fetchIssueDetail();
        } catch (error) {
            console.error('Action error:', error);
            toast.error(error.response?.data?.message || 'Failed to perform action');
        }
    };

    const getTimeRemaining = (deadline) => {
        if (!deadline) return 'N/A';
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;

        if (diff < 0) return <span style={{ color: 'red' }}>Overdue</span>;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${days}d ${hours}h remaining`;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!issue) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Issue not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate('/resolution/issues')} sx={{ mr: 2 }}>
                    <BackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    Issue Details - {issue.issue_number}
                </Typography>
                <StatusBadge status={issue.status} />
            </Box>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid item xs={12} md={8}>
                    {/* Issue Information */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Issue Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Type</Typography>
                                <Chip label={issue.issue_type?.replace('_', ' ')} color="primary" size="small" sx={{ mt: 0.5 }} />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Status</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <StatusBadge status={issue.status} />
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Created</Typography>
                                <Typography variant="body1">{new Date(issue.created_at).toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Deadline</Typography>
                                <Typography variant="body1">
                                    {issue.issue_deadline ? new Date(issue.issue_deadline).toLocaleString() : 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {getTimeRemaining(issue.issue_deadline)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Description</Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {issue.issue_description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Parties Information */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Parties Involved
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Creator</Typography>
                                        </Box>
                                        <Typography variant="body2"><strong>Name:</strong> {issue.creator_name}</Typography>
                                        <Typography variant="body2"><strong>Email:</strong> {issue.creator_email}</Typography>
                                        {issue.creator_phone && (
                                            <Typography variant="body2"><strong>Phone:</strong> {issue.creator_phone}</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                                                <PersonIcon />
                                            </Avatar>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Other Party</Typography>
                                        </Box>
                                        <Typography variant="body2"><strong>Name:</strong> {issue.other_party_name}</Typography>
                                        <Typography variant="body2"><strong>Email:</strong> {issue.other_party_email}</Typography>
                                        {issue.other_party_phone && (
                                            <Typography variant="body2"><strong>Phone:</strong> {issue.other_party_phone}</Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Advertisement Information */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Advertisement
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                                <AdIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {issue.ad_title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Price: £{issue.ad_price}
                                </Typography>
                            </Box>
                        </Box>
                        {issue.ad_description && (
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                {issue.ad_description}
                            </Typography>
                        )}
                    </Paper>

                    {/* Messages */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Messages ({issue.messages?.length || 0})
                        </Typography>
                        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                            {issue.messages?.map((message, index) => (
                                <Box key={message.id} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: message.is_system_message ? 'warning.main' : 'primary.main' }}>
                                            <MessageIcon fontSize="small" />
                                        </Avatar>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                            {message.is_system_message ? 'System' : message.user_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                            {new Date(message.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ ml: 5, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                        {message.message}
                                    </Typography>
                                    {index < issue.messages.length - 1 && <Divider sx={{ mt: 2 }} />}
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column - Actions */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Admin Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Button
                                variant="outlined"
                                startIcon={<ExtendIcon />}
                                onClick={() => setExtendDialogOpen(true)}
                                fullWidth
                            >
                                Extend Deadline
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<NoteIcon />}
                                onClick={() => setNoteDialogOpen(true)}
                                fullWidth
                            >
                                Add Note
                            </Button>
                            {issue.status === 'pending' && (
                                <>
                                    <Divider sx={{ my: 1 }} />
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<AcceptIcon />}
                                        onClick={() => {
                                            setActionType('accept');
                                            setActionDialogOpen(true);
                                        }}
                                        fullWidth
                                    >
                                        Force Accept
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<RejectIcon />}
                                        onClick={() => {
                                            setActionType('reject');
                                            setActionDialogOpen(true);
                                        }}
                                        fullWidth
                                    >
                                        Force Reject
                                    </Button>
                                </>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<CloseIcon />}
                                onClick={() => {
                                    setActionType('close');
                                    setActionDialogOpen(true);
                                }}
                                fullWidth
                            >
                                Close Issue
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialogs */}
            <Dialog open={extendDialogOpen} onClose={() => setExtendDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Extend Issue Deadline</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            type="number"
                            label="Extend by (days)"
                            value={formData.days}
                            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                            fullWidth
                            inputProps={{ min: 1, max: 30 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExtendDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleExtendDeadline} variant="contained">Extend</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Admin Note</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Note"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddNote} variant="contained">Add Note</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={actionDialogOpen}
                title={`${actionType === 'accept' ? 'Force Accept' : actionType === 'reject' ? 'Force Reject' : 'Close'} Issue`}
                message={
                    <Box>
                        <Typography>
                            Are you sure you want to {actionType} this issue?
                        </Typography>
                        <TextField
                            label="Reason (optional)"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                }
                onConfirm={handleAction}
                onCancel={() => setActionDialogOpen(false)}
                confirmText={actionType === 'accept' ? 'Accept' : actionType === 'reject' ? 'Reject' : 'Close'}
                confirmColor={actionType === 'accept' ? 'success' : 'error'}
            />
        </Box>
    );
};

export default IssueDetail;
