import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
} from '@mui/material';
import { useChat } from '../context/ChatContext';

export const RoomSettingsModal = ({ open, onClose }) => {
  const { activeRoom, contacts } = useChat();

  const members = contacts.filter((c) => activeRoom.members?.includes(c.id));

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ className: 'hud-card', sx: { width: 400, p: 1 } }}>
      <DialogTitle className="glow-cyan" sx={{ fontWeight: 700 }}>
        ROOM SETTINGS — #{activeRoom.name}
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 1 }}>
          NODE_ID: {activeRoom.id}
        </Typography>

        <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.15)', my: 1.5 }} />

        <Typography variant="subtitle2" className="glow-cyan" sx={{ fontWeight: 700, mb: 1 }}>
          ACTIVE ROOM MEMBERS ({members.length})
        </Typography>

        <List sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: 'rgba(7,7,12,0.6)', borderRadius: 1 }}>
          {members.map((member) => (
            <ListItem key={member.id}>
              <ListItemAvatar>
                <Avatar src={member.avatarUrl} sx={{ width: 30, height: 30 }} />
              </ListItemAvatar>
              <ListItemText
                primary={member.name}
                secondary={member.email}
                primaryTypographyProps={{ fontSize: '0.85rem', color: '#e2e8f0' }}
                secondaryTypographyProps={{ fontSize: '0.7rem', color: '#64748b' }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
