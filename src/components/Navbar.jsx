import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
} from '@mui/material';
import {
  Sensors as SensorIcon,
  SensorsOff as SensorOffIcon,
  Terminal as TerminalIcon,
  Google as GoogleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { buildGoogleOAuthUrl } from '../utils/googleAuth';

export const Navbar = ({ onOpenProfile }) => {
  const { user, logout, authError, signUp, login } = useAuth();
  const { connected } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleGoogleAuth = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const targetUrl = buildGoogleOAuthUrl(apiBaseUrl);
    window.location.assign(targetUrl);
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!signupForm.name.trim() || !signupForm.email.trim() || !signupForm.password.trim()) {
      setFormError('Please complete all fields.');
      return;
    }

    const success = await signUp(signupForm);
    if (success) {
      setSignupForm({ name: '', email: '', password: '' });
      setAuthDialogOpen(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setFormError('Please enter your email and password.');
      return;
    }

    const success = await login(loginForm);
    if (success) {
      setLoginForm({ email: '', password: '' });
      setAuthDialogOpen(false);
    }
  };

  return (
    <AppBar
      position="static"
      className="hud-card"
      sx={{
        zIndex: 1200,
        boxShadow: '0 4px 20px rgba(0, 240, 255, 0.15)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '56px !important' }}>
        {/* Brand Logo & HUD Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TerminalIcon sx={{ color: '#00f0ff', filter: 'drop-shadow(0 0 6px #00f0ff)' }} />
          <Typography
            variant="h6"
            className="glow-cyan"
            sx={{ fontWeight: 700, letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            NEXUS<span style={{ color: '#ff007f' }}>_CHAT</span>
          </Typography>

          <Chip
            size="small"
            icon={connected ? <SensorIcon style={{ color: '#00ff66' }} /> : <SensorOffIcon style={{ color: '#ff007f' }} />}
            label={connected ? 'GRID_ONLINE' : 'CONNECTING...'}
            sx={{
              backgroundColor: connected ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255, 0, 127, 0.1)',
              borderColor: connected ? '#00ff66' : '#ff007f',
              color: connected ? '#00ff66' : '#ff007f',
              fontSize: '0.7rem',
              fontWeight: 700,
              height: '24px',
            }}
            variant="outlined"
          />
        </Box>

        {/* User Auth Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user ? (
            console.log(user),
            <>
              {authError ? (
                <Typography variant="caption" sx={{ color: '#ffdf00', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
                  {authError}
                </Typography>
              ) : null}
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#00f0ff', fontSize: '0.65rem' }}>
                  {user.email}
                </Typography>
              </Box>

              <IconButton onClick={handleOpenMenu} sx={{ p: 0.5, border: '1px solid #00f0ff' }}>
                <Avatar alt={user.name} src={user.avatarUrl} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 34, height: 34 }} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                  className: 'hud-card',
                  sx: { mt: 1, minWidth: 180 },
                }}
              >
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  USER_ID: {user.id}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    onOpenProfile?.();
                  }}
                  sx={{ color: '#00f0ff', gap: 1 }}
                >
                  <PersonIcon fontSize="small" /> MY PROFILE
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    logout();
                  }}
                  sx={{ color: '#ff007f', gap: 1 }}
                >
                  <LogoutIcon fontSize="small" /> LOGOUT
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<GoogleIcon />}
              onClick={() => setAuthDialogOpen(true)}
              sx={{ borderRadius: '4px', fontSize: '0.75rem' }}
            >
              Google Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Login Dialog Modal */}
      <Dialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        PaperProps={{ className: 'hud-card', sx: { p: 2, maxWidth: 460 } }}
      >
        <DialogTitle className="glow-cyan" sx={{ textAlign: 'center', fontWeight: 700 }}>
          {mode === 'login' ? 'LOGIN TO YOUR NODE' : 'CREATE YOUR ACCESS NODE'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center' }}>
              {mode === 'login'
                ? 'Sign in to your account and continue your conversations.'
                : 'Create a local account to start private DMs instantly, or continue with Google.'}
            </Typography>

            {formError ? (
              <Typography variant="body2" sx={{ color: '#ff007f', fontWeight: 700, textAlign: 'center' }}>
                {formError}
              </Typography>
            ) : null}

            {mode === 'signup' ? (
              <>
                <TextField
                  label="Display name"
                  value={signupForm.name}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, name: event.target.value }))}
                  size="small"
                />
              </>
            ) : null}

            <TextField
              label="Email"
              type="email"
              value={mode === 'signup' ? signupForm.email : loginForm.email}
              onChange={(event) => {
                if (mode === 'signup') {
                  setSignupForm((prev) => ({ ...prev, email: event.target.value }));
                } else {
                  setLoginForm((prev) => ({ ...prev, email: event.target.value }));
                }
              }}
              size="small"
            />
            <TextField
              label="Password"
              type="password"
              value={mode === 'signup' ? signupForm.password : loginForm.password}
              onChange={(event) => {
                if (mode === 'signup') {
                  setSignupForm((prev) => ({ ...prev, password: event.target.value }));
                } else {
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }));
                }
              }}
              size="small"
              error={mode === 'login' && Boolean(authError)}
              helperText={mode === 'login' && authError ? authError : ''}
            />

            <Button
              variant="text"
              size="small"
              onClick={() => {
                setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
                setFormError('');
              }}
              sx={{ color: '#00f0ff', alignSelf: 'center' }}
            >
              {mode === 'login' ? 'Need an account? Create one' : 'Already have an account? Log in'}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', px: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            color={mode === 'login' ? 'primary' : 'secondary'}
            onClick={mode === 'login' ? handleLogin : handleSignup}
            sx={{ borderRadius: '4px' }}
          >
            {mode === 'login' ? 'Login' : 'Create Account'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleAuth}
            sx={{ borderRadius: '4px', borderColor: '#00f0ff', color: '#00f0ff' }}
          >
            Continue with Google
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};
