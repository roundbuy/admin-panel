import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Card,
  CardMedia,
  CardActions,
  Fab,
  Input,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Slider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  LocationOn as CityIcon,
  Image as ImageIcon,
  Delete as DeleteImageIcon,
  MyLocation as LocationIcon,
  PhotoCamera as PhotoCameraIcon,
  Map as MapIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import DataTable from '../../components/Common/DataTable';
import StatusBadge from '../../components/Common/StatusBadge';
import SearchBar from '../../components/Common/SearchBar';
import ConfirmDialog from '../../components/Common/ConfirmDialog';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import adminService from '../../services/admin.service';

const DemoAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    category_id: '',
    subcategory_id: '',
    activity_id: '',
    condition_id: '',
    age_id: '',
    gender_id: '',
    size_id: '',
    color_id: '',
    status: 'draft',
    images: [],
    views_count: 0,
    user_name: 'Demo User',
    latitude: null,
    longitude: null,
    address: '',
    location_radius: 5
  });

  // Image upload state
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // Google Maps state
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 40.7128,
    lng: -74.0060
  }); // Default to New York
  const [mapCenter, setMapCenter] = useState(selectedLocation);

  // Demo data options
  const cities = [
    { name: 'London', code: 'LDN' },
    { name: 'Paris', code: 'PAR' },
    { name: 'New York', code: 'NYC' },
    { name: 'Tokyo', code: 'TKY' }
  ];

  const [categories, setCategories] = useState([]);
  const [adActivities, setAdActivities] = useState([]);
  const [adConditions, setAdConditions] = useState([]);
  const [adAges, setAdAges] = useState([]);
  const [adGenders, setAdGenders] = useState([]);
  const [adSizes, setAdSizes] = useState([]);
  const [adColors, setAdColors] = useState([]);

  // Demo advertisements data with location coordinates
  const demoAdvertisements = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max 256GB',
      description: 'Brand new iPhone 15 Pro Max in titanium blue color. Excellent condition, barely used.',
      price: 1199,
      city: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      address: '10 Downing Street, London SW1A 2AA, UK',
      category_name: 'Electronics',
      activity_name: 'Sell',
      condition_name: 'Excellent',
      age_name: 'Young',
      gender_name: 'Other',
      size_name: 'M',
      color_name: 'Blue',
      status: 'published',
      views_count: 245,
      created_at: '2024-12-01T10:00:00Z',
      user_name: 'John Smith',
      images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400'],
      location_radius: 10
    },
    {
      id: 2,
      title: 'Vintage Leather Jacket',
      description: 'Classic brown leather jacket from the 1980s. Perfect for vintage fashion lovers.',
      price: 180,
      city: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
      category_name: 'Fashion',
      activity_name: 'Sell',
      condition_name: 'Good',
      age_name: 'Old',
      gender_name: 'Male',
      size_name: 'L',
      color_name: 'Brown',
      status: 'pending',
      views_count: 87,
      created_at: '2024-12-02T14:30:00Z',
      user_name: 'Marie Dubois',
      images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'],
      location_radius: 5
    },
    {
      id: 3,
      title: 'Apartment for Rent - Manhattan',
      description: 'Beautiful 2-bedroom apartment in Manhattan with city views and modern amenities.',
      price: 3500,
      city: 'New York',
      latitude: 40.7589,
      longitude: -73.9851,
      address: '350 5th Ave, New York, NY 10118, USA',
      category_name: 'Real Estate',
      activity_name: 'Rent',
      condition_name: 'Excellent',
      age_name: 'Young',
      gender_name: 'Other',
      size_name: 'L',
      color_name: 'White',
      status: 'approved',
      views_count: 156,
      created_at: '2024-12-01T09:15:00Z',
      user_name: 'Sarah Johnson',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'],
      location_radius: 15
    },
    {
      id: 4,
      title: 'Japanese Anime Collectibles',
      description: 'Rare collection of anime figures and merchandise. Looking to trade or sell.',
      price: 500,
      city: 'Tokyo',
      latitude: 35.6762,
      longitude: 139.6503,
      address: '2-11-3 Marunouchi, Chiyoda City, Tokyo 100-0005, Japan',
      category_name: 'Sports & Hobbies',
      activity_name: 'Sell',
      condition_name: 'Good',
      age_name: 'Young',
      gender_name: 'Other',
      size_name: 'M',
      color_name: 'Multi',
      status: 'draft',
      views_count: 23,
      created_at: '2024-12-03T16:45:00Z',
      user_name: 'Yuki Tanaka',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'],
      location_radius: 8
    },
    {
      id: 5,
      title: 'Luxury Car Service',
      description: 'Professional chauffeur service for events and business trips in London.',
      price: 200,
      city: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      address: 'Westminster, London SW1A 0AA, UK',
      category_name: 'Services',
      activity_name: 'Services',
      condition_name: 'Excellent',
      age_name: 'Young',
      gender_name: 'Other',
      size_name: 'L',
      color_name: 'Black',
      status: 'published',
      views_count: 89,
      created_at: '2024-11-30T11:20:00Z',
      user_name: 'James Wilson',
      images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400'],
      location_radius: 25
    }
  ];

  useEffect(() => {
    loadFormOptions();
    setAdvertisements(demoAdvertisements);
    setLoading(false);
  }, []);

  const loadFormOptions = async () => {
    try {
      const [categoriesRes, activitiesRes, conditionsRes, agesRes, gendersRes, sizesRes, colorsRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getAdActivities(),
        adminService.getAdConditions(),
        adminService.getAdAges(),
        adminService.getAdGenders(),
        adminService.getAdSizes(),
        adminService.getAdColors()
      ]);

      setCategories(categoriesRes.data.data || []);
      setAdActivities(activitiesRes.data.data || []);
      setAdConditions(conditionsRes.data.data || []);
      setAdAges(agesRes.data.data || []);
      setAdGenders(gendersRes.data.data || []);
      setAdSizes(sizesRes.data.data || []);
      setAdColors(colorsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load form options:', error);
    }
  };

  // Image handling functions
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviewUrls];

    files.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) { // 5MB limit
        newImageFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newImagePreviews.push(e.target.result);
          setImageFiles([...newImageFiles]);
          setImagePreviewUrls([...newImagePreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviewUrls.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);
    setImagePreviewUrls(newImagePreviews);
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Location handling functions
  const openMapSelector = () => {
    setMapOpen(true);
    setMapCenter(selectedLocation);
  };

  const closeMapSelector = () => {
    setMapOpen(false);
  };

  const handleLocationSelect = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    });
  };

  const updateLocationRadius = (value) => {
    setFormData({
      ...formData,
      location_radius: value
    });
  };

  const clearLocation = () => {
    setSelectedLocation({ lat: 0, lng: 0 });
    setFormData({
      ...formData,
      latitude: null,
      longitude: null,
      address: ''
    });
  };

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      price: '',
      city: '',
      category_id: '',
      subcategory_id: '',
      activity_id: '',
      condition_id: '',
      age_id: '',
      gender_id: '',
      size_id: '',
      color_id: '',
      status: 'draft',
      images: [],
      views_count: 0,
      user_name: 'Demo User',
      latitude: null,
      longitude: null,
      address: '',
      location_radius: 5
    });
    setImageFiles([]);
    setImagePreviewUrls([]);
    clearLocation();
    setDialogOpen(true);
  };

  const handleEdit = (ad) => {
    setIsEditing(true);
    setSelectedAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      price: ad.price.toString(),
      city: ad.city,
      category_id: '',
      subcategory_id: '',
      activity_id: '',
      condition_id: '',
      age_id: '',
      gender_id: '',
      size_id: '',
      color_id: '',
      status: ad.status,
      images: ad.images || [],
      views_count: ad.views_count,
      user_name: ad.user_name,
      latitude: ad.latitude || null,
      longitude: ad.longitude || null,
      address: ad.address || '',
      location_radius: ad.location_radius || 5
    });
    
    // Set images
    if (ad.images && ad.images.length > 0) {
      setImagePreviewUrls([...ad.images]);
    } else {
      setImagePreviewUrls([]);
    }
    setImageFiles([]);

    // Set location
    if (ad.latitude && ad.longitude) {
      const location = { lat: ad.latitude, lng: ad.longitude };
      setSelectedLocation(location);
      setMapCenter(location);
    }
    
    setDialogOpen(true);
  };

  const handleDelete = (ad) => {
    setSelectedAd(ad);
    setDeleteDialogOpen(true);
  };

  const handleSave = () => {
    // Combine existing images with new uploaded images
    const allImages = [...formData.images, ...imagePreviewUrls];
    
    if (isEditing) {
      const updatedAds = advertisements.map(ad => 
        ad.id === selectedAd.id 
          ? { 
              ...ad, 
              ...formData, 
              price: parseFloat(formData.price),
              images: allImages,
              category_name: categories.find(c => c.id == formData.category_id)?.name || 'Unknown',
              activity_name: adActivities.find(a => a.id == formData.activity_id)?.name || 'Unknown',
              condition_name: adConditions.find(c => c.id == formData.condition_id)?.name || 'Unknown',
              age_name: adAges.find(a => a.id == formData.age_id)?.name || 'Unknown',
              gender_name: adGenders.find(g => g.id == formData.gender_id)?.name || 'Unknown',
              size_name: adSizes.find(s => s.id == formData.size_id)?.name || 'Unknown',
              color_name: adColors.find(c => c.id == formData.color_id)?.name || 'Unknown'
            }
          : ad
      );
      setAdvertisements(updatedAds);
      toast.success('Advertisement updated successfully');
    } else {
      const newAd = {
        id: Math.max(...advertisements.map(a => a.id)) + 1,
        ...formData,
        price: parseFloat(formData.price),
        images: allImages,
        category_name: categories.find(c => c.id == formData.category_id)?.name || 'Unknown',
        activity_name: adActivities.find(a => a.id == formData.activity_id)?.name || 'Unknown',
        condition_name: adConditions.find(c => c.id == formData.condition_id)?.name || 'Unknown',
        age_name: adAges.find(a => a.id == formData.age_id)?.name || 'Unknown',
        gender_name: adGenders.find(g => g.id == formData.gender_id)?.name || 'Unknown',
        size_name: adSizes.find(s => s.id == formData.size_id)?.name || 'Unknown',
        color_name: adColors.find(c => c.id == formData.color_id)?.name || 'Unknown',
        created_at: new Date().toISOString()
      };
      setAdvertisements([...advertisements, newAd]);
      toast.success('Advertisement created successfully');
    }
    setDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    const updatedAds = advertisements.filter(ad => ad.id !== selectedAd.id);
    setAdvertisements(updatedAds);
    setDeleteDialogOpen(false);
    toast.success('Advertisement deleted successfully');
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  // Filter advertisements based on search, city, and status
  const filteredAdvertisements = advertisements.filter(ad => {
    const matchesSearch = !search || 
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      ad.description.toLowerCase().includes(search.toLowerCase()) ||
      ad.user_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesCity = !cityFilter || ad.city === cityFilter;
    const matchesStatus = !statusFilter || ad.status === statusFilter;
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  const columns = [
    {
      id: 'images',
      label: 'Images',
      minWidth: 80,
      format: (images) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ImageIcon fontSize="small" />
          {images && images.length > 0 ? `${images.length}` : '0'}
          {images && images.length > 0 && (
            <Avatar 
              src={images[0]} 
              sx={{ width: 24, height: 24 }}
              variant="rounded"
            />
          )}
        </Box>
      )
    },
    {
      id: 'title',
      label: 'Title',
      minWidth: 200
    },
    {
      id: 'city',
      label: 'Location',
      minWidth: 150,
      format: (value, row) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <CityIcon fontSize="small" />
            <Typography variant="caption">{value}</Typography>
          </Box>
          {row.latitude && row.longitude && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationIcon fontSize="small" sx={{ fontSize: 12 }} />
              <Typography variant="caption" color="textSecondary">
                {row.latitude.toFixed(4)}, {row.longitude.toFixed(4)}
              </Typography>
            </Box>
          )}
        </Box>
      )
    },
    {
      id: 'category_name',
      label: 'Category',
      minWidth: 120
    },
    {
      id: 'activity_name',
      label: 'Activity',
      minWidth: 100
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 100,
      format: (value) => `${value}`
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => <StatusBadge status={value} />
    },
    {
      id: 'views_count',
      label: 'Views',
      minWidth: 80
    },
    {
      id: 'user_name',
      label: 'User',
      minWidth: 150
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Demo Advertisement Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Advertisement
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by title, description, or user..."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter by City"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All Cities</MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.code} value={city.name}>
                {city.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Demo Notice */}
      <Box sx={{ 
        p: 2, 
        mb: 3, 
        bgcolor: 'info.light', 
        borderRadius: 1, 
        border: '1px solid',
        borderColor: 'info.main'
      }}>
        <Typography variant="body2" color="info.contrastText">
          📍 <strong>Demo Mode:</strong> This page shows sample advertisements for demonstration purposes. 
          Data includes cities: London, Paris, New York, and Tokyo with various advertisement types.
        </Typography>
      </Box>

      {/* Data Table */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={filteredAdvertisements}
          totalRows={filteredAdvertisements.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Advertisement' : 'Add New Advertisement'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              {/* Image Upload Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Images ({imagePreviewUrls.length}/10)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Upload up to 10 images (max 5MB each). Supported formats: JPG, PNG, GIF
                </Alert>
                
                {/* Image Upload Button */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    component="label"
                    disabled={imageFiles.length >= 10}
                  >
                    Select Images
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={handleImageSelect}
                    />
                  </Button>
                  {imagePreviewUrls.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ClearIcon />}
                      onClick={clearAllImages}
                      size="small"
                    >
                      Clear All
                    </Button>
                  )}
                </Box>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <List dense>
                    {imagePreviewUrls.map((url, index) => (
                      <ListItem key={index} divider>
                        <ListItemAvatar>
                          <Avatar src={url} variant="rounded" sx={{ width: 50, height: 50 }} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={`Image ${index + 1}`}
                          secondary={url.startsWith('blob:') ? 'New upload' : 'Existing image'}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => removeImage(index)}
                          >
                            <DeleteImageIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>

              {/* Location Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Location
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Set the precise location using Google Maps integration for better ad visibility
                </Alert>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<MapIcon />}
                    onClick={openMapSelector}
                  >
                    Select on Map
                  </Button>
                  {(formData.latitude && formData.longitude) && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ClearIcon />}
                      onClick={clearLocation}
                      size="small"
                    >
                      Clear Location
                    </Button>
                  )}
                </Box>

                {/* Current Location Display */}
                {(formData.latitude && formData.longitude) ? (
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationIcon color="primary" fontSize="small" />
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          Selected Location
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {formData.address || `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                      </Typography>
                      
                      {/* Location Radius Slider */}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          Search Radius: {formData.location_radius} km
                        </Typography>
                        <Slider
                          value={formData.location_radius}
                          onChange={(_, value) => updateLocationRadius(value)}
                          min={1}
                          max={50}
                          step={1}
                          marks={[
                            { value: 1, label: '1km' },
                            { value: 10, label: '10km' },
                            { value: 25, label: '25km' },
                            { value: 50, label: '50km' }
                          ]}
                          valueLabelDisplay="auto"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="warning">
                    No location selected. Click "Select on Map" to choose the ad location.
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                >
                  {cities.map((city) => (
                    <MenuItem key={city.code} value={city.name}>
                      {city.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Activity</InputLabel>
                  <Select
                    value={formData.activity_id}
                    onChange={(e) => setFormData({ ...formData, activity_id: e.target.value })}
                  >
                    {adActivities.map((activity) => (
                      <MenuItem key={activity.id} value={activity.id}>
                        {activity.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    value={formData.condition_id}
                    onChange={(e) => setFormData({ ...formData, condition_id: e.target.value })}
                  >
                    {adConditions.map((condition) => (
                      <MenuItem key={condition.id} value={condition.id}>
                        {condition.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Age</InputLabel>
                  <Select
                    value={formData.age_id}
                    onChange={(e) => setFormData({ ...formData, age_id: e.target.value })}
                  >
                    {adAges.map((age) => (
                      <MenuItem key={age.id} value={age.id}>
                        {age.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender_id}
                    onChange={(e) => setFormData({ ...formData, gender_id: e.target.value })}
                  >
                    {adGenders.map((gender) => (
                      <MenuItem key={gender.id} value={gender.id}>
                        {gender.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Size</InputLabel>
                  <Select
                    value={formData.size_id}
                    onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                  >
                    {adSizes.map((size) => (
                      <MenuItem key={size.id} value={size.id}>
                        {size.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select
                    value={formData.color_id}
                    onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                  >
                    {adColors.map((color) => (
                      <MenuItem key={color.id} value={color.id}>
                        {color.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Advertisement"
        message={`Are you sure you want to delete "${selectedAd?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Google Maps Dialog */}
      <Dialog open={mapOpen} onClose={closeMapSelector} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapIcon />
            Select Advertisement Location
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Demo Mode:</strong> Google Maps integration is ready for implementation. 
            This demo shows a simulated map interface.
          </Alert>
          
          {/* Demo Map Container */}
          <Box
            sx={{
              height: 400,
              bgcolor: 'grey.100',
              border: '2px dashed',
              borderColor: 'grey.300',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Demo Map Background */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, #e3f2fd 25%, transparent 25%), linear-gradient(-45deg, #e3f2fd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e3f2fd 75%), linear-gradient(-45deg, transparent 75%, #e3f2fd 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                opacity: 0.3
              }}
            />
            
            {/* Map Center Marker */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: 1
              }}
              onClick={handleLocationSelect}
            >
              <LocationIcon 
                sx={{ 
                  fontSize: 40, 
                  color: 'primary.main',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }} 
              />
            </Box>
            
            {/* Demo Content */}
            <Box sx={{ textAlign: 'center', zIndex: 1 }}>
              <MapIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" color="primary.main" gutterBottom>
                Interactive Map Interface
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Click the location icon to select coordinates<br />
                Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </Typography>
            </Box>
          </Box>

          {/* Location Coordinates Display */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Coordinates:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Latitude: {selectedLocation.lat.toFixed(6)}<br />
              Longitude: {selectedLocation.lng.toFixed(6)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeMapSelector}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setFormData({
                ...formData,
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
                address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
              });
              closeMapSelector();
              toast.success('Location selected successfully!');
            }}
          >
            Confirm Location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemoAdvertisements;