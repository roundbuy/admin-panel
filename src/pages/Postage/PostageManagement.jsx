import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, LocalShipping as ShippingIcon } from '@mui/icons-material';
import postageService from '../../services/postageService';
import { useSnackbar } from 'notistack';

const PostageManagement = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [carriers, setCarriers] = useState([]);
  const [rates, setRates] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Modals
  const [carrierModal, setCarrierModal] = useState({ open: false, data: null });
  const [rateModal, setRateModal] = useState({ open: false, data: null });

  useEffect(() => {
    fetchData(tabIndex);
  }, [tabIndex]);

  const fetchData = async (index) => {
    setLoading(true);
    try {
      if (index === 0) {
        const res = await postageService.getShipments({});
        setShipments(res.data || []);
      } else if (index === 1) {
        const res = await postageService.getCarriers();
        setCarriers(res.data || []);
      } else if (index === 2) {
        const res = await postageService.getRates();
        setRates(res.data || []);
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCarrierSave = async () => {
    try {
      if (carrierModal.data.id) {
        await postageService.updateCarrier(carrierModal.data.id, carrierModal.data);
        enqueueSnackbar('Carrier updated', { variant: 'success' });
      } else {
        await postageService.createCarrier(carrierModal.data);
        enqueueSnackbar('Carrier created', { variant: 'success' });
      }
      setCarrierModal({ open: false, data: null });
      fetchData(1);
    } catch (err) {
      enqueueSnackbar('Failed to save carrier', { variant: 'error' });
    }
  };

  const handleDeleteCarrier = async (id) => {
    if (window.confirm('Delete carrier?')) {
      try {
        await postageService.deleteCarrier(id);
        enqueueSnackbar('Carrier deleted', { variant: 'success' });
        fetchData(1);
      } catch (err) {
        enqueueSnackbar('Failed to delete carrier', { variant: 'error' });
      }
    }
  };

  const handleRateSave = async () => {
    try {
      await postageService.createRate(rateModal.data);
      enqueueSnackbar('Rate created', { variant: 'success' });
      setRateModal({ open: false, data: null });
      fetchData(2);
    } catch (err) {
      enqueueSnackbar('Failed to save rate', { variant: 'error' });
    }
  };

  const handleDeleteRate = async (id) => {
    if (window.confirm('Delete rate?')) {
      try {
        await postageService.deleteRate(id);
        enqueueSnackbar('Rate deleted', { variant: 'success' });
        fetchData(2);
      } catch (err) {
        enqueueSnackbar('Failed to delete rate', { variant: 'error' });
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ShippingIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">Postage & Shipping</Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} centered>
          <Tab label="Shipments" />
          <Tab label="Carriers" />
          <Tab label="Rates" />
        </Tabs>
      </Paper>

      {tabIndex === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Carrier</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shipments.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.tracking_number}</TableCell>
                  <TableCell>{s.user_name}</TableCell>
                  <TableCell>{s.carrier_name} - {s.service_name}</TableCell>
                  <TableCell><Chip label={s.status} size="small" color={s.status === 'delivered' ? 'success' : 'warning'} /></TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabIndex === 1 && (
        <Box>
          <Button variant="contained" onClick={() => setCarrierModal({ open: true, data: { name: '', is_active: true } })} sx={{ mb: 2 }}>
            Add Carrier
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {carriers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell><Chip label={c.is_active ? 'Active' : 'Inactive'} color={c.is_active ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell>
                      <IconButton onClick={() => setCarrierModal({ open: true, data: c })}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeleteCarrier(c.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tabIndex === 2 && (
        <Box>
          <Button variant="contained" onClick={() => setRateModal({ open: true, data: { carrier_id: '', zone_id: 1, service_name: '', base_rate: 0 } })} sx={{ mb: 2 }}>
            Add Rate
          </Button>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Carrier</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Zone</TableCell>
                  <TableCell>Weight Range (kg)</TableCell>
                  <TableCell>Base Rate</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rates.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.carrier_name}</TableCell>
                    <TableCell>{r.service_name}</TableCell>
                    <TableCell>{r.zone_name}</TableCell>
                    <TableCell>{r.min_weight_kg} - {r.max_weight_kg}</TableCell>
                    <TableCell>${r.base_rate}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteRate(r.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Carrier Modal */}
      <Dialog open={carrierModal.open} onClose={() => setCarrierModal({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{carrierModal.data?.id ? 'Edit' : 'Add'} Carrier</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={carrierModal.data?.name || ''} onChange={e => setCarrierModal(p => ({...p, data: {...p.data, name: e.target.value}}))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCarrierModal({ open: false, data: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleCarrierSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Rate Modal */}
      <Dialog open={rateModal.open} onClose={() => setRateModal({ open: false, data: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Add Rate</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Service Name" value={rateModal.data?.service_name || ''} onChange={e => setRateModal(p => ({...p, data: {...p.data, service_name: e.target.value}}))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Carrier ID" value={rateModal.data?.carrier_id || ''} onChange={e => setRateModal(p => ({...p, data: {...p.data, carrier_id: e.target.value}}))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Zone ID" value={rateModal.data?.zone_id || ''} onChange={e => setRateModal(p => ({...p, data: {...p.data, zone_id: e.target.value}}))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Min Weight (kg)" value={rateModal.data?.min_weight_kg || ''} onChange={e => setRateModal(p => ({...p, data: {...p.data, min_weight_kg: e.target.value}}))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Max Weight (kg)" value={rateModal.data?.max_weight_kg || ''} onChange={e => setRateModal(p => ({...p, data: {...p.data, max_weight_kg: e.target.value}}))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="number" label="Base Rate" value={rateModal.data?.base_rate || ''} onChange={e => setRateModal(p => ({...p, data: {...p.data, base_rate: e.target.value}}))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateModal({ open: false, data: null })}>Cancel</Button>
          <Button variant="contained" onClick={handleRateSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostageManagement;
