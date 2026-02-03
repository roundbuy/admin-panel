import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Button,
    Divider
} from '@mui/material';
import {
    PhoneIphone as PhoneIcon
} from '@mui/icons-material';

const NotificationPreview = ({ notification }) => {
    const [activeTab, setActiveTab] = useState(0); // 0 = Collapsed, 1 = Expanded, 2 = Full-Screen

    // Get values with fallbacks
    const collapsedIcon = notification.collapsed_icon || '📱';
    const collapsedIconBg = notification.collapsed_icon_bg_color || '#1E3A8A';
    const collapsedTitle = notification.collapsed_title || 'Notification Title';
    const collapsedMessage = notification.collapsed_message || 'Notification message';
    const collapsedTimestamp = notification.collapsed_timestamp_text || '2min';

    const expandedIcon = notification.expanded_icon || collapsedIcon;
    const expandedIconBg = notification.expanded_icon_bg_color || collapsedIconBg;
    const expandedTitle = notification.expanded_title || collapsedTitle;
    const expandedMessage = notification.expanded_message || collapsedMessage;
    const expandedButton1Text = notification.expanded_button_1_text || 'Button 1';
    const expandedButton1Color = notification.expanded_button_1_color || '#2563EB';
    const expandedButton2Text = notification.expanded_button_2_text;
    const expandedButton2Color = notification.expanded_button_2_color || '#FFFFFF';

    const fullscreenShowLogo = notification.fullscreen_show_logo !== false;
    const fullscreenIcon = notification.fullscreen_icon || expandedIcon;
    const fullscreenIconBg = notification.fullscreen_icon_bg_color || expandedIconBg;
    const fullscreenHeading = notification.fullscreen_heading || expandedTitle;
    const fullscreenSubheading = notification.fullscreen_subheading || '';
    const fullscreenDescription = notification.fullscreen_description || expandedMessage;
    const fullscreenPrimaryText = notification.fullscreen_primary_button_text || 'Primary';
    const fullscreenPrimaryColor = notification.fullscreen_primary_button_color || '#2563EB';
    const fullscreenSecondaryText = notification.fullscreen_secondary_button_text;
    const fullscreenSecondaryColor = notification.fullscreen_secondary_button_color || '#6B7280';

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Live Preview
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                See how your notification will appear to users
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="fullWidth">
                    <Tab label="Collapsed" />
                    <Tab label="Expanded" />
                    <Tab label="Full-Screen" />
                </Tabs>
            </Box>

            {/* Mobile Frame */}
            <Box sx={{
                mt: 3,
                mx: 'auto',
                width: 320,
                height: 600,
                border: '8px solid #000',
                borderRadius: '30px',
                overflow: 'hidden',
                bgcolor: '#f5f5f5',
                position: 'relative'
            }}>
                {/* Status Bar */}
                <Box sx={{
                    height: 30,
                    bgcolor: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    fontSize: 12
                }}>
                    <span>9:41</span>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <span>📶</span>
                        <span>📡</span>
                        <span>🔋</span>
                    </Box>
                </Box>

                {/* Content Area */}
                <Box sx={{ p: 2, height: 'calc(100% - 30px)', overflow: 'auto', bgcolor: '#f5f5f5' }}>
                    {/* Collapsed State */}
                    {activeTab === 0 && (
                        <Box sx={{
                            bgcolor: '#fff',
                            borderRadius: 2,
                            p: 1.5,
                            boxShadow: 1,
                            display: 'flex',
                            gap: 1.5,
                            alignItems: 'flex-start'
                        }}>
                            <Box sx={{
                                width: 40,
                                height: 40,
                                bgcolor: collapsedIconBg,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                fontSize: 20
                            }}>
                                {collapsedIcon.startsWith('http') ? '🔔' : collapsedIcon}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight="600" sx={{ fontSize: 13 }}>
                                        {collapsedTitle}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, ml: 1 }}>
                                        {collapsedTimestamp}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, display: 'block' }}>
                                    {collapsedMessage}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>›</Typography>
                        </Box>
                    )}

                    {/* Expanded State */}
                    {activeTab === 1 && (
                        <Box sx={{
                            bgcolor: '#fff',
                            borderRadius: 2,
                            p: 2,
                            boxShadow: 2
                        }}>
                            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: expandedIconBg,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontSize: 20
                                }}>
                                    {expandedIcon.startsWith('http') ? '🔔' : expandedIcon}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" fontWeight="600" sx={{ fontSize: 14 }}>
                                            {expandedTitle}
                                        </Typography>
                                        <Typography sx={{ fontSize: 16 }}>^</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                                        {expandedMessage}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    fullWidth
                                    sx={{
                                        bgcolor: expandedButton1Color,
                                        color: '#fff',
                                        textTransform: 'none',
                                        fontSize: 12,
                                        '&:hover': { bgcolor: expandedButton1Color }
                                    }}
                                >
                                    {expandedButton1Text}
                                </Button>
                                {expandedButton2Text && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        sx={{
                                            borderColor: expandedButton2Color,
                                            color: expandedButton2Color === '#FFFFFF' ? '#000' : expandedButton2Color,
                                            textTransform: 'none',
                                            fontSize: 12
                                        }}
                                    >
                                        {expandedButton2Text}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* Full-Screen State */}
                    {activeTab === 2 && (
                        <Box sx={{
                            bgcolor: '#fff',
                            borderRadius: 2,
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Box sx={{ textAlign: 'right', mb: 2 }}>
                                <Typography sx={{ fontSize: 20, cursor: 'pointer' }}>✕</Typography>
                            </Box>
                            {fullscreenShowLogo && (
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        RoundBuy
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{
                                width: 60,
                                height: 60,
                                bgcolor: fullscreenIconBg,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                                fontSize: 30
                            }}>
                                {fullscreenIcon.startsWith('http') ? '🔔' : fullscreenIcon}
                            </Box>
                            <Typography variant="h6" fontWeight="600" textAlign="center" sx={{ mb: 1, fontSize: 18 }}>
                                {fullscreenHeading}
                            </Typography>
                            {fullscreenSubheading && (
                                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2, fontSize: 13 }}>
                                    {fullscreenSubheading}
                                </Typography>
                            )}
                            <Typography variant="body2" sx={{ mb: 3, fontSize: 12, flex: 1, overflow: 'auto' }}>
                                {fullscreenDescription}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        bgcolor: fullscreenPrimaryColor,
                                        color: '#fff',
                                        textTransform: 'none',
                                        fontSize: 13,
                                        '&:hover': { bgcolor: fullscreenPrimaryColor }
                                    }}
                                >
                                    {fullscreenPrimaryText}
                                </Button>
                                {fullscreenSecondaryText && (
                                    <Button
                                        variant="text"
                                        fullWidth
                                        sx={{
                                            color: fullscreenSecondaryColor,
                                            textTransform: 'none',
                                            fontSize: 13
                                        }}
                                    >
                                        {fullscreenSecondaryText}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default NotificationPreview;
