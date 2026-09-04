import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  Badge,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useChat } from '../context/ChatContext';

export const NewDMModal = ({ open, onClose }) => {
  const { contacts, startDM } = useChat();
  const [query, setQuery] = useState('');

  const filtered = contacts.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (contact) => {
    startDM(contact);
    setQuery('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        className: 'hud-card',
        sx: { width: { xs: '92vw', sm: 380 }, p: { xs: 0.5, sm: 1 }, m: { xs: 1, sm: 2 } },
      }}
    >
      <DialogTitle className="glow-pink" sx={{ fontWeight: 700, letterSpacing: '0.08em', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        START DIRECT TRANSMISSION (DM)
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="SEARCH CONTACTS..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#ff007f', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, mt: 1 }}
        />

        <List sx={{ maxHeight: 250, overflowY: 'auto' }}>
          {filtered.map((contact) => (
            <ListItem
              key={contact.id}
              button
              onClick={() => handleSelect(contact)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': { bgcolor: 'rgba(255, 0, 127, 0.1)' },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: contact.isOnline ? '#00ff66' : '#64748b',
                    },
                  }}
                >
                  <Avatar src={contact.avatarUrl} sx={{ width: 32, height: 32 }} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={contact.name}
                secondary={contact.isOnline ? 'Online' : contact.lastSeen || 'Offline'}
                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}
                secondaryTypographyProps={{ fontSize: '0.7rem', color: contact.isOnline ? '#00ff66' : '#64748b' }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};
