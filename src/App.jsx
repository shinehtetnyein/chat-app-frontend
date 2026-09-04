import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography, useTheme, useMediaQuery, Drawer } from '@mui/material';
import { cyberpunkTheme } from './theme/cyberpunkTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { AuthPage } from './components/AuthPage';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { RightPanel } from './components/RightPanel';
import { CreateGroupModal } from './components/CreateGroupModal';
import { NewDMModal } from './components/NewDMModal';
import { RoomSettingsModal } from './components/RoomSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Snackbar, Alert } from '@mui/material';

// ── Handles the Google OAuth redirect callback ─────────────────────────────
const OAuthCallbackHandler = () => {
  const { completeGoogleOAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      completeGoogleOAuth(token);
      window.history.replaceState({}, '', '/');
    }
  }, [completeGoogleOAuth]);

  return null;
};

// ── Full-screen loading spinner shown while session is being restored ──────
const SplashLoader = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 2,
    }}
  >
    <CircularProgress size={48} sx={{ color: '#00f0ff' }} />
    <Typography
      variant="caption"
      sx={{ color: '#64748b', letterSpacing: '0.2em', fontFamily: 'Rajdhani', fontSize: '0.75rem' }}
    >
      INITIALIZING NEXUS…
    </Typography>
  </Box>
);

// ── Main chat layout (only rendered when user is authenticated) ────────────
const MainLayout = () => {
  const { rightPanelOpen, setRightPanelOpen, toast, closeToast, activeRoomId } = useChat();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newDMOpen, setNewDMOpen] = useState(false);
  const [roomSettingsOpen, setRoomSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // On mobile: true shows ChatArea, false shows Sidebar
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(activeRoomId));

  // Sync mobile view if activeRoomId changes
  useEffect(() => {
    if (activeRoomId && isMobile) {
      setMobileShowChat(true);
    }
  }, [activeRoomId, isMobile]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Navbar */}
      <Navbar onOpenProfile={() => setProfileOpen(true)} />

      {/* Responsive Chat Layout */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Sidebar */}
        <Box
          sx={{
            display: isMobile ? (mobileShowChat ? 'none' : 'flex') : 'flex',
            width: isMobile ? '100%' : { md: 280, lg: 320 },
            flexShrink: 0,
            height: '100%',
          }}
        >
          <Sidebar
            onOpenCreateGroup={() => setCreateGroupOpen(true)}
            onOpenNewDM={() => setNewDMOpen(true)}
            onSelectRoom={() => {
              if (isMobile) setMobileShowChat(true);
            }}
          />
        </Box>

        {/* Main Chat Stream */}
        <Box
          sx={{
            display: isMobile ? (mobileShowChat ? 'flex' : 'none') : 'flex',
            flex: 1,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <ChatArea
            onToggleRightPanel={() => setRightPanelOpen((prev) => !prev)}
            onBack={() => setMobileShowChat(false)}
          />
        </Box>

        {/* Right Info Panel: Inline on desktop (> 1200px), Drawer on mobile/tablet */}
        {isDesktop ? (
          rightPanelOpen && (
            <RightPanel
              onClose={() => setRightPanelOpen(false)}
              onOpenSettings={() => setRoomSettingsOpen(true)}
            />
          )
        ) : (
          <Drawer
            anchor="right"
            open={rightPanelOpen}
            onClose={() => setRightPanelOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: '88vw', sm: 340 },
                maxWidth: 380,
                bgcolor: '#0c0b18',
                borderLeft: '1px solid rgba(0, 240, 255, 0.3)',
                backgroundImage: 'none',
              },
            }}
          >
            <RightPanel
              onClose={() => setRightPanelOpen(false)}
              onOpenSettings={() => setRoomSettingsOpen(true)}
            />
          </Drawer>
        )}
      </Box>

      {/* Dialog Modals */}
      <CreateGroupModal open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
      <NewDMModal open={newDMOpen} onClose={() => setNewDMOpen(false)} />
      <RoomSettingsModal open={roomSettingsOpen} onClose={() => setRoomSettingsOpen(false)} />
      <UserProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* HUD Toast System */}
      <Snackbar
        open={toast?.open}
        autoHideDuration={5000}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeToast}
          severity={toast?.severity || 'info'}
          variant="filled"
          sx={{
            width: '100%',
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            border: '1px solid #00f0ff',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
          }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ── Root gate: auth check → show Auth page or Chat ────────────────────────
const AppGate = () => {
  const { user, loading } = useAuth();

  return (
    <>
      <OAuthCallbackHandler />
      {loading ? (
        <SplashLoader />
      ) : !user ? (
        <AuthPage />
      ) : (
        <SocketProvider>
          <ChatProvider>
            <MainLayout />
          </ChatProvider>
        </SocketProvider>
      )}
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={cyberpunkTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
