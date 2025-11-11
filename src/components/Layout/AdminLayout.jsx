import React from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import LogoutIcon from '@mui/icons-material/Logout';

const DRAWER_WIDTH = 240;

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: '#fff',
            color: '#2c3e50',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
              {/* Page title will be set by each page */}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {user?.full_name || user?.email}
              </Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#3f51b5' }}>
                {user?.full_name?.charAt(0) || 'A'}
              </Avatar>
              <IconButton onClick={logout} size="small" title="Logout">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;