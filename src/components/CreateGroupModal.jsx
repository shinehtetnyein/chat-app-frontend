import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  Avatar,
  Typography,
  Box,
} from '@mui/material';
import { useChat } from '../context/ChatContext';

export const CreateGroupModal = ({ open, onClose }) => {
  const { contacts, createGroup } = useChat();
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) return;
    createGroup(groupName.trim(), selectedIds);
    setGroupName('');
    setSelectedIds([]);
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
        sx: { width: { xs: '92vw', sm: 400 }, p: { xs: 0.5, sm: 1 }, m: { xs: 1, sm: 2 } },
      }}
    >
      <DialogTitle className="glow-cyan" sx={{ fontWeight: 700, letterSpacing: '0.08em', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        CREATE NEW GROUP CHANNEL
      </DialogTitle>
      
      <DialogContent>
        <TextField
          fullWidth
          label="Channel Name"
          placeholder="e.g. netrunner-squad"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          size="small"
          sx={{ mb: 2, mt: 1 }}
        />

        <Typography variant="caption" className="glow-pink" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
          SELECT MEMBERS ({selectedIds.length} SELECTED)
        </Typography>

        <List sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: 'rgba(7,7,12,0.6)', borderRadius: 1 }}>
          {contacts.map((contact) => (
            <ListItem
              key={contact.id}
              button
              onClick={() => handleToggle(contact.id)}
              sx={{ borderBottom: '1px solid rgba(0,240,255,0.08)' }}
            >
              <Checkbox
                checked={selectedIds.includes(contact.id)}
                sx={{ color: '#00f0ff', '&.Mui-checked': { color: '#ff007f' } }}
              />
              <ListItemAvatar>
                <Avatar src={contact.avatarUrl} sx={{ width: 30, height: 30 }} />
              </ListItemAvatar>
              <ListItemText
                primary={contact.name}
                secondary={contact.email}
                primaryTypographyProps={{ fontSize: '0.85rem', color: '#e2e8f0' }}
                secondaryTypographyProps={{ fontSize: '0.7rem', color: '#64748b' }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#94a3b8' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          disabled={!groupName.trim()}
        >
          Initialize Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};
