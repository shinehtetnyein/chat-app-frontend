import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// ── Animated scan-line overlay ──────────────────────────────────────────────
const ScanLines = () => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      background:
        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.012) 2px, rgba(0,240,255,0.012) 4px)',
    }}
  />
);

// ── Floating neon orbs ───────────────────────────────────────────────────────
const NeonOrbs = () => (
  <>
    <Box
      sx={{
        position: 'fixed', top: '10%', left: '5%', width: 320, height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,240,255,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orbFloat 8s ease-in-out infinite',
      }}
    />
    <Box
      sx={{
        position: 'fixed', bottom: '15%', right: '8%', width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,0,127,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orbFloat 10s ease-in-out infinite reverse',
      }}
    />
    <Box
      sx={{
        position: 'fixed', top: '55%', left: '50%', width: 200, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,102,0.06) 0%, transparent 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        animation: 'orbFloat 12s ease-in-out infinite 2s',
      }}
    />
  </>
);

export const AuthPage = () => {
  const { login, signUp, authError, loginWithGoogle } = useAuth();

  const [tab, setTab] = useState(0); // 0 = login, 1 = register
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleTabChange = (_, newVal) => {
    setTab(newVal);
    setLocalError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!loginForm.email || !loginForm.password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const ok = await login({ email: loginForm.email, password: loginForm.password });
    setLoading(false);
    if (!ok) setLocalError(authError || 'Login failed. Please try again.');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setLocalError('All fields are required.');
      return;
    }
    if (registerForm.password !== registerForm.confirm) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (registerForm.password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const ok = await signUp({ name: registerForm.name, email: registerForm.email, password: registerForm.password });
    setLoading(false);
    if (!ok) setLocalError(authError || 'Registration failed. Please try again.');
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(0,0,0,0.3)',
      '& fieldset': { borderColor: 'rgba(0,240,255,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(0,240,255,0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#00f0ff', boxShadow: '0 0 8px rgba(0,240,255,0.3)' },
    },
    '& .MuiInputLabel-root': { color: '#64748b' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#00f0ff' },
    '& .MuiInputBase-input': { color: '#e2e8f0' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#07070c',
      }}
    >
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(0,240,255,0.08), 0 0 60px rgba(0,0,0,0.8); }
          50% { box-shadow: 0 0 40px rgba(0,240,255,0.15), 0 0 80px rgba(0,0,0,0.8); }
        }
        @keyframes logoPulse {
          0%, 100% { text-shadow: 0 0 10px rgba(0,240,255,0.5), 0 0 30px rgba(0,240,255,0.3); }
          50% { text-shadow: 0 0 20px rgba(0,240,255,0.8), 0 0 60px rgba(0,240,255,0.4); }
        }
        @keyframes scanIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ScanLines />
      <NeonOrbs />

      {/* Auth Card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 440,
          mx: 2,
          borderRadius: 3,
          bgcolor: 'rgba(16,15,29,0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,240,255,0.18)',
          animation: 'cardGlow 4s ease-in-out infinite, scanIn 0.5s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Top accent bar */}
        <Box sx={{ height: 3, background: 'linear-gradient(90deg, #00f0ff, #ff007f, #00ff66, #00f0ff)', backgroundSize: '200% 100%' }} />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo / Brand */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
              <TerminalIcon sx={{ color: '#00f0ff', fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'Rajdhani, monospace',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#00f0ff',
                  animation: 'logoPulse 3s ease-in-out infinite',
                }}
              >
                NEXUS
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', letterSpacing: '0.2em', fontSize: '0.68rem' }}>
              SECURE NETRUNNER COMMS NETWORK
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTab-root': { color: '#64748b', fontFamily: 'Rajdhani', fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.85rem' },
              '& .Mui-selected': { color: '#00f0ff !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#00f0ff', boxShadow: '0 0 8px #00f0ff' },
              borderBottom: '1px solid rgba(0,240,255,0.12)',
            }}
          >
            <Tab label="LOGIN" id="auth-tab-login" aria-controls="auth-panel-login" />
            <Tab label="REGISTER" id="auth-tab-register" aria-controls="auth-panel-register" />
          </Tabs>

          {/* Error Banner */}
          {localError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                bgcolor: 'rgba(255,0,127,0.1)',
                border: '1px solid rgba(255,0,127,0.3)',
                color: '#ff6fa3',
                '& .MuiAlert-icon': { color: '#ff007f' },
                fontSize: '0.78rem',
              }}
            >
              {localError}
            </Alert>
          )}

          {/* ── LOGIN PANEL ───────────────────────────────────────── */}
          {tab === 0 && (
            <Box
              component="form"
              id="auth-panel-login"
              role="tabpanel"
              aria-labelledby="auth-tab-login"
              onSubmit={handleLogin}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                id="login-email"
                label="EMAIL"
                type="email"
                fullWidth
                size="small"
                value={loginForm.email}
                onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                id="login-password"
                label="PASSWORD"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                size="small"
                value={loginForm.password}
                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((p) => !p)} sx={{ color: '#64748b' }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <Button
                id="btn-login-submit"
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 0.5,
                  py: 1.2,
                  fontFamily: 'Rajdhani',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '0.15em',
                  bgcolor: '#00f0ff',
                  color: '#000',
                  boxShadow: '0 0 16px rgba(0,240,255,0.4)',
                  '&:hover': { bgcolor: '#00d0e0', boxShadow: '0 0 24px rgba(0,240,255,0.6)' },
                  '&:disabled': { bgcolor: 'rgba(0,240,255,0.2)', color: 'rgba(0,240,255,0.4)' },
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: '#00f0ff' }} /> : 'JACK IN'}
              </Button>

              <Divider sx={{ borderColor: 'rgba(0,240,255,0.1)', my: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', px: 1 }}>OR</Typography>
              </Divider>

              <Button
                id="btn-login-google"
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1,
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  borderColor: 'rgba(255,0,127,0.4)',
                  color: '#ff007f',
                  '&:hover': { borderColor: '#ff007f', bgcolor: 'rgba(255,0,127,0.08)', boxShadow: '0 0 12px rgba(255,0,127,0.3)' },
                }}
              >
                SIGN IN WITH GOOGLE
              </Button>

              <Typography
                variant="caption"
                sx={{ textAlign: 'center', color: '#64748b', cursor: 'pointer', mt: 0.5 }}
                onClick={() => { setTab(1); setLocalError(''); }}
              >
                No account?{' '}
                <Box component="span" sx={{ color: '#00f0ff', '&:hover': { textDecoration: 'underline' } }}>
                  Register here
                </Box>
              </Typography>
            </Box>
          )}

          {/* ── REGISTER PANEL ───────────────────────────────────────── */}
          {tab === 1 && (
            <Box
              component="form"
              id="auth-panel-register"
              role="tabpanel"
              aria-labelledby="auth-tab-register"
              onSubmit={handleRegister}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                id="register-name"
                label="NETRUNNER NAME"
                fullWidth
                size="small"
                value={registerForm.name}
                onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                id="register-email"
                label="EMAIL"
                type="email"
                fullWidth
                size="small"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                id="register-password"
                label="PASSWORD"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                size="small"
                value={registerForm.password}
                onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((p) => !p)} sx={{ color: '#64748b' }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <TextField
                id="register-confirm"
                label="CONFIRM PASSWORD"
                type={showConfirm ? 'text' : 'password'}
                fullWidth
                size="small"
                value={registerForm.confirm}
                onChange={(e) => setRegisterForm((p) => ({ ...p, confirm: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#ff007f', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm((p) => !p)} sx={{ color: '#64748b' }}>
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />

              <Button
                id="btn-register-submit"
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 0.5,
                  py: 1.2,
                  fontFamily: 'Rajdhani',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  letterSpacing: '0.15em',
                  background: 'linear-gradient(90deg, #ff007f, #c40063)',
                  boxShadow: '0 0 16px rgba(255,0,127,0.4)',
                  '&:hover': { background: 'linear-gradient(90deg, #ff2d95, #ff007f)', boxShadow: '0 0 24px rgba(255,0,127,0.6)' },
                  '&:disabled': { bgcolor: 'rgba(255,0,127,0.2)', color: 'rgba(255,0,127,0.4)' },
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: '#ff007f' }} /> : 'CREATE ACCOUNT'}
              </Button>

              <Divider sx={{ borderColor: 'rgba(0,240,255,0.1)', my: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', px: 1 }}>OR</Typography>
              </Divider>

              <Button
                id="btn-register-google"
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1,
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  borderColor: 'rgba(255,0,127,0.4)',
                  color: '#ff007f',
                  '&:hover': { borderColor: '#ff007f', bgcolor: 'rgba(255,0,127,0.08)', boxShadow: '0 0 12px rgba(255,0,127,0.3)' },
                }}
              >
                SIGN UP WITH GOOGLE
              </Button>

              <Typography
                variant="caption"
                sx={{ textAlign: 'center', color: '#64748b', cursor: 'pointer', mt: 0.5 }}
                onClick={() => { setTab(0); setLocalError(''); }}
              >
                Already have an account?{' '}
                <Box component="span" sx={{ color: '#00f0ff', '&:hover': { textDecoration: 'underline' } }}>
                  Login here
                </Box>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bottom accent bar */}
        <Box sx={{ height: 2, background: 'linear-gradient(90deg, #ff007f, #00f0ff)', opacity: 0.5 }} />
      </Box>
    </Box>
  );
};
