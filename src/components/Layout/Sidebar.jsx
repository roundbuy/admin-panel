import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CardMembership as CardIcon,
  Campaign as CampaignIcon,
  ViewQuilt as BannerIcon,
  Subscriptions as SubscriptionsIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Api as ApiIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [plansOpen, setPlansOpen] = React.useState(true);
  const [contentOpen, setContentOpen] = React.useState(true);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { title: 'Users', path: '/users', icon: <PeopleIcon /> },
    {
      title: 'Plans',
      icon: <CardIcon />,
      children: [
        { title: 'Subscriptions', path: '/plans/subscriptions' },
        { title: 'Advertisements', path: '/plans/advertisements' },
        { title: 'Banners', path: '/plans/banners' },
      ],
    },
    {
      title: 'Content',
      icon: <CampaignIcon />,
      children: [
        { title: 'Advertisements', path: '/content/advertisements' },
        { title: 'Banners', path: '/content/banners' },
      ],
    },
    { title: 'Subscriptions', path: '/subscriptions', icon: <SubscriptionsIcon /> },
    { title: 'Languages', path: '/languages', icon: <LanguageIcon /> },
    { title: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    { title: 'Moderation', path: '/moderation/words', icon: <ShieldIcon /> },
    { title: 'API Logs', path: '/api/logs', icon: <ApiIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a2e',
          color: '#ecf0f1',
          borderRight: 'none',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#16213e',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#fff',
          }}
        >
          RoundBuy
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ pt: 2, px: 1 }}>
        {menuItems.map((item, index) => {
          if (item.children) {
            const isOpen = item.title === 'Plans' ? plansOpen : contentOpen;
            const setOpen = item.title === 'Plans' ? setPlansOpen : setContentOpen;
            
            return (
              <Box key={index}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setOpen(!isOpen)}
                    sx={{
                      py: 1.2,
                      px: 2,
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    <ListItemIcon sx={{ color: '#95a5a6', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#ecf0f1',
                      }}
                    />
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child, childIndex) => (
                      <ListItem key={childIndex} disablePadding>
                        <ListItemButton
                          onClick={() => navigate(child.path)}
                          sx={{
                            py: 1,
                            pl: 6,
                            pr: 2,
                            borderRadius: 1,
                            mb: 0.5,
                            backgroundColor: isActive(child.path) ? '#3f51b5' : 'transparent',
                            '&:hover': {
                              backgroundColor: isActive(child.path) ? '#3f51b5' : 'rgba(255,255,255,0.08)',
                            },
                          }}
                        >
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontSize: '0.813rem',
                              fontWeight: isActive(child.path) ? 600 : 400,
                              color: isActive(child.path) ? '#fff' : '#bdc3c7',
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.2,
                  px: 2,
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor: isActive(item.path) ? '#3f51b5' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.path) ? '#3f51b5' : 'rgba(255,255,255,0.08)',
                  },
                  borderLeft: isActive(item.path) ? '3px solid #fff' : '3px solid transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? '#fff' : '#95a5a6',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 500,
                    color: isActive(item.path) ? '#fff' : '#ecf0f1',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;