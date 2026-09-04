import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  Typography,
  IconButton,
  Badge,
  MenuItem,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Badge as BadgeIcon,
  AccessTime as TimeIcon,
  AlternateEmail as EmailIcon,
  Circle as CircleIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export const UserProfileModal = ({ open, onClose }) => {
  const { user, loginWithGoogle } = useAuth();
  const { uploadFileToS3, updateOwnProfile } = useChat();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
      setStatus(user.status || 'online');
    }
    setSaveError('');
  }, [user, open]);

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const publicUrl = await uploadFileToS3(file);
      setAvatarUrl(publicUrl);
    } catch (err) {
      console.warn('Avatar upload fallback:', err);
      setAvatarUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await updateOwnProfile({
        name: name.trim(),
        avatarUrl,
        status,
      });
      onClose();
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'online': return '#00ff66';
      case 'away': return '#ffe600';
      case 'busy': return '#ff007f';
      default: return '#64748b';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        className: 'hud-card',
        sx: { width: { xs: '92vw', sm: 420 }, p: { xs: 0.5, sm: 1 }, m: { xs: 1, sm: 2 } },
      }}
    >
      <DialogTitle className="glow-cyan" sx={{ fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
        NETRUNNER PROFILE CONFIG
      </DialogTitle>

      <DialogContent>
        {/* Avatar Upload & Status Badge */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <CircleIcon sx={{ color: getStatusColor(status), fontSize: 18, filter: `drop-shadow(0 0 6px ${getStatusColor(status)})` }} />
              }
            >
              <Avatar
                src={avatarUrl}
                alt={name}
                imgProps={{ referrerPolicy: 'no-referrer' }}
                sx={{
                  width: 90,
                  height: 90,
                  border: user?.provider === 'google' ? '2px solid #4285F4' : '2px solid #00f0ff',
                  boxShadow: user?.provider === 'google' ? '0 0 20px rgba(66, 133, 244, 0.4)' : '0 0 20px rgba(0, 240, 255, 0.4)',
                }}
              />
            </Badge>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
              style={{ display: 'none' }}
              accept="image/*"
            />

            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || saving}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: -4,
                bgcolor: '#00f0ff',
                color: '#000',
                '&:hover': { bgcolor: '#00d0e0' },
                boxShadow: '0 0 10px #00f0ff',
              }}
            >
              {uploading ? <CircularProgress size={16} sx={{ color: '#000' }} /> : <CameraIcon fontSize="small" />}
            </IconButton>
          </Box>

          <Typography variant="caption" sx={{ color: '#94a3b8', mt: 1 }}>
            Click camera icon to upload new avatar image (S3)
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.15)', my: 2 }} />

        {/* Display Name Edit */}
        <TextField
          fullWidth
          label="Display Name / Netrunner Alias"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          disabled={saving}
          sx={{ mb: 2 }}
        />

        {/* Status Selector */}
        <TextField
          fullWidth
          select
          label="Online Presence Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="small"
          disabled={saving}
          sx={{ mb: 2 }}
        >
          <MenuItem value="online">🟢 Online & Active</MenuItem>
          <MenuItem value="away">🟡 Away / AFK</MenuItem>
          <MenuItem value="busy">🔴 Do Not Disturb / Busy</MenuItem>
          <MenuItem value="offline">⚪ Invisible / Offline</MenuItem>
        </TextField>

        {saveError && (
          <Typography variant="caption" sx={{ color: '#ff4d6d', display: 'block', mb: 2 }}>
            {saveError}
          </Typography>
        )}

        {/* Info Meta Cards */}
        <Box sx={{ bgcolor: 'rgba(7, 7, 12, 0.6)', p: 1.5, borderRadius: 1, border: '1px solid rgba(0, 240, 255, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                Email: {user?.email || 'netrunner@cyberpunk.io'}
              </Typography>
            </Box>
            {user?.provider === 'google' && (
              <Chip
                icon={<GoogleIcon style={{ color: '#4285F4', fontSize: 14 }} />}
                label="Google"
                size="small"
                variant="outlined"
                sx={{ borderColor: '#4285F4', color: '#4285F4', fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BadgeIcon sx={{ color: '#ff007f', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
              ID: {user?.id || 'usr_netrunner_01'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TimeIcon sx={{ color: '#00ff66', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#00ff66' }}>
              Last Active: {status === 'online' ? 'Active Now' : '2 minutes ago'}
            </Typography>
          </Box>

          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed rgba(0, 240, 255, 0.15)' }}>
            {user?.provider === 'google' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GoogleIcon sx={{ color: '#4285F4', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#4285F4', fontWeight: 700 }}>
                  Logged in with Google Account
                </Typography>
              </Box>
            ) : (
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<GoogleIcon sx={{ color: '#4285F4' }} />}
                onClick={() => {
                  onClose();
                  loginWithGoogle();
                }}
                sx={{
                  borderColor: '#4285F4',
                  color: '#00f0ff',
                  fontSize: '0.72rem',
                  py: 0.5,
                  '&:hover': { borderColor: '#4285F4', bgcolor: 'rgba(66, 133, 244, 0.12)' },
                }}
              >
                Log In with Google Account
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8' }} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!name.trim() || saving}
          startIcon={saving ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : null}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};