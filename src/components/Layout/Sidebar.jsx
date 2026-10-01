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
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Paper,
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
  AttachMoney as CurrencyIcon,
  Public as CountryIcon,
  Category as CategoryIcon,
  FitnessCenter as ActivityIcon,
  CheckCircle as ConditionIcon,
  HourglassEmpty as AgeIcon,
  Wc as GenderIcon,
  Straighten as SizeIcon,
  Palette as ColorIcon,
  ExpandLess,
  ExpandMore,
  HelpOutline as HelpIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  EmojiEvents as RewardsIcon,
  Feedback as FeedbackIcon,
  Timeline as AnalyticsIcon,
  Event as EventIcon,
  Whatshot as TrendingIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as VerifiedUserIcon,
  LocalShipping as ShippingIcon,
  Traffic as TrafficIcon,
} from '@mui/icons-material';
import { useSidebar } from '../../context/SidebarContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMinimized, setIsMinimized, DRAWER_WIDTH, DRAWER_WIDTH_MINIMIZED } = useSidebar();
  const [plansOpen, setPlansOpen] = React.useState(true);
  const [contentOpen, setContentOpen] = React.useState(true);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [walletsOpen, setWalletsOpen] = React.useState(false);
  const [rewardsOpen, setRewardsOpen] = React.useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = React.useState(true);

  // State for popup menu when minimized
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [popupMenuItems, setPopupMenuItems] = React.useState([]);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    {
      title: 'Marketplace',
      icon: <AnalyticsIcon />,
      open: marketplaceOpen,
      setOpen: setMarketplaceOpen,
      children: [
        { title: 'KPI Overview', path: '/marketplace-dashboard' },
        { title: 'Traffic Analytics', path: '/marketplace/traffic' },
      ],
    },
    { title: 'Users', path: '/users', icon: <PeopleIcon /> },
    { title: 'Seller Metrics', path: '/seller-metrics', icon: <ActivityIcon /> },
    { title: 'Onboarding Analytics', path: '/analytics/onboarding', icon: <AnalyticsIcon /> },
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
        { title: 'Demo Advertisements', path: '/content/demo-advertisements' },
        { title: 'Categories', path: '/content/categories' },
        { title: 'Ad Activities', path: '/content/ad-activities' },
        { title: 'Ad Conditions', path: '/content/ad-conditions' },
        { title: 'Ad Ages', path: '/content/ad-ages' },
        { title: 'Ad Genders', path: '/content/ad-genders' },
        { title: 'Ad Sizes', path: '/content/ad-sizes' },
        { title: 'Ad Colors', path: '/content/ad-colors' },
      ],
    },
    { title: 'Events', path: '/events', icon: <EventIcon /> },
    { title: 'Trending', path: '/trending', icon: <TrendingIcon /> },
    { title: 'KYC / KYB', path: '/kyc', icon: <VerifiedUserIcon /> },
    { title: 'Postage', path: '/postage', icon: <ShippingIcon /> },
    {
      title: 'Rewards',
      icon: <RewardsIcon />,
      children: [
        { title: 'Overview', path: '/rewards' },
        { title: 'Level Options', path: '/rewards/level-options' },
        { title: 'Referrals', path: '/rewards/referrals' },
        { title: 'Lottery', path: '/rewards/lottery' },
      ],
    },
    { title: 'Subscriptions', path: '/subscriptions', icon: <SubscriptionsIcon /> },
    { title: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
    { title: 'Campaign Notifications', path: '/notifications/campaigns', icon: <CampaignIcon /> },
    { title: 'Messages', path: '/messages', icon: <ChatIcon /> },
    { title: 'Suggestions', path: '/suggestions', icon: <FeedbackIcon /> },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      children: [
        { title: 'General', path: '/settings' },
        { title: 'Languages', path: '/languages' },
        { title: 'Translations', path: '/languages/translations' },
        { title: 'Currencies', path: '/settings/currencies' },
        { title: 'Countries', path: '/settings/countries' },
      ],
    },
    {
      title: 'Wallets',
      icon: <CurrencyIcon />,
      children: [
        { title: 'Reports', path: '/wallets/reports' },
        { title: 'Withdrawals', path: '/wallets/withdrawals' },
      ],
    },
    { title: 'FAQ Management', path: '/faqs', icon: <HelpIcon /> },
    { title: 'Moderation', path: '/moderation/words', icon: <ShieldIcon /> },
    { title: 'API Logs', path: '/api/logs', icon: <ApiIcon /> },
  ];

  // Handlers for popup menu
  const handlePopupOpen = (event, children) => {
    if (isMinimized) {
      setAnchorEl(event.currentTarget);
      setPopupMenuItems(children);
    }
  };

  const handlePopupClose = () => {
    setAnchorEl(null);
    setPopupMenuItems([]);
  };

  const handlePopupItemClick = (path) => {
    navigate(path);
    handlePopupClose();
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isMinimized ? DRAWER_WIDTH_MINIMIZED : DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMinimized ? DRAWER_WIDTH_MINIMIZED : DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a2e',
          color: '#ecf0f1',
          borderRight: 'none',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo and Toggle Button */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMinimized ? 'center' : 'space-between',
          backgroundColor: '#16213e',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {!isMinimized && (
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
        )}
        <Tooltip title={isMinimized ? "Expand Sidebar" : "Collapse Sidebar"} placement="right">
          <IconButton
            onClick={() => setIsMinimized(!isMinimized)}
            sx={{
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            {isMinimized ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Menu Items */}
      <List sx={{ pt: 2, px: 1 }}>
        {menuItems.map((item, index) => {
          if (item.children) {
            const isOpen = item.title === 'Plans' ? plansOpen :
              item.title === 'Content' ? contentOpen :
                item.title === 'Wallets' ? walletsOpen :
                  item.title === 'Rewards' ? rewardsOpen : settingsOpen;
            const setOpen = item.title === 'Plans' ? setPlansOpen :
              item.title === 'Content' ? setContentOpen :
                item.title === 'Wallets' ? setWalletsOpen :
                  item.title === 'Rewards' ? setRewardsOpen : setSettingsOpen;

            return (
              <Box key={index}>
                <ListItem disablePadding>
                  <Tooltip title={isMinimized ? item.title : ""} placement="right">
                    <ListItemButton
                      onClick={(e) => {
                        if (isMinimized) {
                          handlePopupOpen(e, item.children);
                        } else {
                          setOpen(!isOpen);
                        }
                      }}
                      sx={{
                        py: 1.2,
                        px: 2,
                        borderRadius: 1,
                        mb: 0.5,
                        justifyContent: isMinimized ? 'center' : 'flex-start',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      <ListItemIcon sx={{ color: '#95a5a6', minWidth: isMinimized ? 'auto' : 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      {!isMinimized && (
                        <>
                          <ListItemText
                            primary={item.title}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#ecf0f1',
                            }}
                          />
                          {isOpen ? <ExpandLess /> : <ExpandMore />}
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                {!isMinimized && (
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
                )}
              </Box>
            );
          }

          return (
            <ListItem key={index} disablePadding>
              <Tooltip title={isMinimized ? item.title : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    py: 1.2,
                    px: 2,
                    borderRadius: 1,
                    mb: 0.5,
                    justifyContent: isMinimized ? 'center' : 'flex-start',
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
                      minWidth: isMinimized ? 'auto' : 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isMinimized && (
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive(item.path) ? 600 : 500,
                        color: isActive(item.path) ? '#fff' : '#ecf0f1',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Popup Menu for Submenus when Minimized */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopupClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            ml: 1,
            backgroundColor: '#1a1a2e',
            color: '#ecf0f1',
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          },
        }}
      >
        {popupMenuItems.map((child, index) => (
          <MenuItem
            key={index}
            onClick={() => handlePopupItemClick(child.path)}
            sx={{
              py: 1.5,
              px: 2,
              fontSize: '0.875rem',
              color: isActive(child.path) ? '#fff' : '#bdc3c7',
              backgroundColor: isActive(child.path) ? '#3f51b5' : 'transparent',
              '&:hover': {
                backgroundColor: isActive(child.path) ? '#3f51b5' : 'rgba(255,255,255,0.08)',
              },
            }}
          >
            {child.title}
          </MenuItem>
        ))}
      </Menu>
    </Drawer>
  );
};

export default Sidebar;