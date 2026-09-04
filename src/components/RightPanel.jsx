import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  People as PeopleIcon,
  PermMedia as MediaIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useChat } from '../context/ChatContext';

export const RightPanel = ({ onClose, onOpenSettings }) => {
  const { activeRoom, contacts, messages } = useChat();

  // Extract room members
  const memberList = contacts.filter(
    (c) => activeRoom?.members?.includes(c.id) || c.id === 'usr_netrunner_01'
  );

  // Extract shared media attachments from message history
  const sharedMedia = (messages || []).filter((m) => m.attachmentUrl);

  return (
    <Box
      className="hud-card"
      sx={{
        width: '100%',
        maxWidth: { lg: 320 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: { xs: 'none', lg: '1px solid rgba(0, 240, 255, 0.2)' },
        bgcolor: '#0c0b18',
        p: { xs: 1.5, sm: 2 },
        overflowY: 'auto',
      }}
    >
      {/* Panel Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" className="glow-cyan" sx={{ fontWeight: 700 }}>
          ROOM_DATA
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#ff007f' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Room Summary Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar
          src={activeRoom.avatar}
          imgProps={{ referrerPolicy: 'no-referrer' }}
          sx={{
            width: 64,
            height: 64,
            margin: 'auto',
            mb: 1,
            border: '2px solid #00f0ff',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0' }}>
          {activeRoom.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#00f0ff', textTransform: 'uppercase' }}>
          Type: {activeRoom.type}
        </Typography>
        
        <Button
          fullWidth
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<SettingsIcon />}
          onClick={onOpenSettings}
          sx={{ mt: 1.5, fontSize: '0.7rem' }}
        >
          Manage Room
        </Button>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.15)', my: 2 }} />

      {/* Room Members Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PeopleIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
          <Typography variant="caption" className="glow-cyan" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
            MEMBERS ({memberList.length})
          </Typography>
        </Box>

        <List disablePadding>
          {memberList.map((member) => (
            <ListItem key={member.id} disablePadding sx={{ mb: 1 }}>
              <ListItemAvatar sx={{ minWidth: 36 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: member.isOnline ? '#00ff66' : '#64748b',
                      boxShadow: member.isOnline ? '0 0 6px #00ff66' : 'none',
                    },
                  }}
                >
                  <Avatar src={member.avatarUrl} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 28, height: 28 }} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                secondary={member.isOnline ? 'Online' : member.lastSeen || 'Offline'}
                primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}
                secondaryTypographyProps={{ fontSize: '0.65rem', color: member.isOnline ? '#00ff66' : '#64748b' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.15)', my: 2 }} />

      {/* Shared Media Gallery */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <MediaIcon sx={{ color: '#ff007f', fontSize: 18 }} />
          <Typography variant="caption" className="glow-pink" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
            SHARED MEDIA ({sharedMedia.length})
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {sharedMedia.map((m, idx) => (
            <Box
              key={idx}
              component="img"
              src={m.attachmentUrl}
              alt="Shared Media"
              sx={{
                width: '100%',
                height: 60,
                objectFit: 'cover',
                borderRadius: 1,
                border: '1px solid rgba(0, 240, 255, 0.3)',
                cursor: 'pointer',
                '&:hover': { border: '1px solid #ff007f' },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
