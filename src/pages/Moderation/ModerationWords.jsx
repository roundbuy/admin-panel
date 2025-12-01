import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const ModerationWords = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    word: '',
    category: 'profanity',
    severity: 'medium',
    is_active: true
  });

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await adminService.getModerationWords({});
      setWords(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch moderation words:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch moderation words');
      setWords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      word: '',
      category: 'profanity',
      severity: 'medium',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (word) => {
    setIsEditing(true);
    setSelectedWord(word);
    setFormData({
      word: word.word,
      category: word.category,
      severity: word.severity,
      is_active: word.is_active
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validate form
      if (!formData.word.trim()) {
        toast.error('Word/phrase is required');
        return;
      }

      if (isEditing) {
        await adminService.updateModerationWord(selectedWord.id, formData);
        toast.success('Word updated successfully');
      } else {
        await adminService.createModerationWord(formData);
        toast.success('Word added successfully');
      }
      setDialogOpen(false);
      fetchWords();
    } catch (error) {
      console.error('Save word error:', error);
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} word`);
    }
  };

  const handleDelete = (word) => {
    setSelectedWord(word);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminService.deleteModerationWord(selectedWord.id);
      toast.success('Word deleted successfully');
      setDeleteDialogOpen(false);
      fetchWords();
    } catch (error) {
      console.error('Delete word error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete word');
    }
  };

  const columns = [
    { id: 'word', label: 'Word/Phrase', minWidth: 200 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'severity', label: 'Severity', minWidth: 100, format: (value) => <StatusBadge status={value} showIcon={false} /> },
    { id: 'is_active', label: 'Status', minWidth: 100, format: (value) => <StatusBadge status={value ? 'active' : 'inactive'} /> },
    { id: 'created_at', label: 'Created', minWidth: 120, format: (value) => new Date(value).toLocaleDateString() }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Moderation Words</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Word
        </Button>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={words}
          totalRows={words.length}
          page={0}
          rowsPerPage={20}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Word' : 'Add New Word'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Word/Phrase"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              fullWidth
              required
              placeholder="Enter word or phrase to moderate"
            />
            
            <TextField
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="profanity">Profanity</MenuItem>
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="hate-speech">Hate Speech</MenuItem>
              <MenuItem value="scam">Scam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              select
              label="Severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Moderation Word"
        message={`Are you sure you want to delete the word "${selectedWord?.word}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default ModerationWords;