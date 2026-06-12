import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Switch, FormControlLabel, CircularProgress } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import api from '../../services/api';

const EventsManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({
        title: '', heading: '', description: '', start_time: '', end_time: '',
        category_tag: '', max_participants: '', allow_bidding: true, chat_enabled: true, entry_fee: 0, status: 'upcoming'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/mobile-app/events?limit=50');
            if (response.data.success) {
                setEvents(response.data.data.events);
            }
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (event = null) => {
        if (event) {
            // format datetime for input
            const formatDt = (dtStr) => dtStr ? new Date(dtStr).toISOString().slice(0, 16) : '';
            setCurrentEvent({
                ...event,
                start_time: formatDt(event.start_time),
                end_time: formatDt(event.end_time)
            });
        } else {
            setCurrentEvent({
                title: '', heading: '', description: '', start_time: '', end_time: '',
                category_tag: '', max_participants: '', allow_bidding: true, chat_enabled: true, entry_fee: 0, status: 'upcoming'
            });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => setOpenModal(false);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setCurrentEvent({ ...currentEvent, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...currentEvent,
                allow_bidding: currentEvent.allow_bidding ? 1 : 0,
                chat_enabled: currentEvent.chat_enabled ? 1 : 0,
                max_participants: currentEvent.max_participants ? parseInt(currentEvent.max_participants) : null,
                entry_fee: parseFloat(currentEvent.entry_fee) || 0
            };

            if (currentEvent.id) {
                await api.put(`/mobile-app/events/${currentEvent.id}`, payload);
            } else {
                await api.post('/mobile-app/events', payload);
            }
            handleCloseModal();
            fetchEvents();
        } catch (error) {
            console.error('Failed to save event', error);
            alert('Failed to save event');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to cancel this event?')) {
            try {
                await api.delete(`/mobile-app/events/${id}`);
                fetchEvents();
            } catch (error) {
                console.error('Failed to delete event', error);
            }
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Events Management</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
                    + Create Event
                </Button>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Subs / Live</TableCell>
                                <TableCell>Features</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <Typography variant="subtitle2">{event.title}</Typography>
                                        <Typography variant="body2" color="textSecondary">{event.heading}</Typography>
                                    </TableCell>
                                    <TableCell>{new Date(event.start_time).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={event.status.toUpperCase()} 
                                            color={event.status === 'live' ? 'error' : event.status === 'upcoming' ? 'primary' : 'default'}
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {event.subscriber_count} / {event.live_participant_count}
                                    </TableCell>
                                    <TableCell>
                                        {event.allow_bidding ? <Chip label="Bidding" size="small" variant="outlined" sx={{mr:0.5}} /> : null}
                                        {event.chat_enabled ? <Chip label="Chat" size="small" variant="outlined" /> : null}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleOpenModal(event)}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(event.id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{currentEvent.id ? 'Edit Event' : 'Create Event'}</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField label="Event Title" name="title" value={currentEvent.title} onChange={handleChange} fullWidth required />
                        <TextField label="Heading / Subtitle" name="heading" value={currentEvent.heading} onChange={handleChange} fullWidth required />
                        <TextField label="Description" name="description" value={currentEvent.description} onChange={handleChange} multiline rows={3} fullWidth />
                        
                        <Box display="flex" gap={2}>
                            <TextField label="Start Time" type="datetime-local" name="start_time" value={currentEvent.start_time} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
                            <TextField label="End Time" type="datetime-local" name="end_time" value={currentEvent.end_time} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth required />
                        </Box>
                        
                        <Box display="flex" gap={2}>
                            <TextField label="Category Tag" name="category_tag" value={currentEvent.category_tag} onChange={handleChange} fullWidth />
                            <TextField label="Max Participants" type="number" name="max_participants" value={currentEvent.max_participants} onChange={handleChange} fullWidth helperText="Leave blank for unlimited" />
                        </Box>
                        
                        <Box display="flex" gap={2}>
                            <TextField label="Entry Fee (£)" type="number" name="entry_fee" value={currentEvent.entry_fee} onChange={handleChange} fullWidth />
                            {currentEvent.id && (
                                <TextField label="Status" select name="status" value={currentEvent.status} onChange={handleChange} fullWidth>
                                    <MenuItem value="upcoming">Upcoming</MenuItem>
                                    <MenuItem value="live">Live</MenuItem>
                                    <MenuItem value="finished">Finished</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </TextField>
                            )}
                        </Box>

                        <Box display="flex" gap={2}>
                            <FormControlLabel control={<Switch checked={!!currentEvent.allow_bidding} onChange={handleChange} name="allow_bidding" />} label="Enable Bidding" />
                            <FormControlLabel control={<Switch checked={!!currentEvent.chat_enabled} onChange={handleChange} name="chat_enabled" />} label="Enable Live Chat" />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EventsManagement;
