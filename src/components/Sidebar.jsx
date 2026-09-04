import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Tag as TagIcon,
  Add as AddIcon,
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ onOpenCreateGroup, onOpenNewDM }) => {
  const { rooms, activeRoomId, selectRoom, contacts } = useChat();
  const auth = useAuth();
  const user = auth ? auth.user : null;
  const [searchTerm, setSearchTerm] = useState('');

  // Deduplicate rooms by type and normalized name to prevent duplicate sidebar entries
  const uniqueRoomsMap = new Map();
  for (const r of rooms) {
    if (!r || !r.name) continue;
    const key = r.type === 'dm'
      ? `dm_${r.name.toLowerCase()}`
      : `channel_${r.name.toLowerCase()}`;
    if (!uniqueRoomsMap.has(key) || r.id === activeRoomId) {
      uniqueRoomsMap.set(key, r);
    }
  }

  const uniqueRoomsList = Array.from(uniqueRoomsMap.values());

  const channels = uniqueRoomsList.filter(
    (r) => r.type === 'channel' && r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const dms = uniqueRoomsList.filter(
    (r) => r.type === 'dm' && r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPreviewText = (text) => {
    if (!text) return undefined;
    if (text.length <= 15) return text;
    return `${text.slice(0, 15)}...`;
  };

  const renderSecondary = (room, lastMsgText) => {
    if (!lastMsgText) return undefined;
    return lastMsgText;
  };

  return (
    <Box
      className="hud-card"
      sx={{
        width: { xs: '100%', md: 280 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(0, 240, 255, 0.2)',
        bgcolor: '#0c0b18',
      }}
    >
      {/* Search Bar & Actions Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(0, 240, 255, 0.15)' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="SEARCH_GRID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            color="primary"
            startIcon={<GroupAddIcon />}
            onClick={onOpenCreateGroup}
            sx={{ fontSize: '0.68rem', py: 0.5, borderColor: 'rgba(0, 240, 255, 0.4)' }}
          >
            + GROUP
          </Button>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<PersonAddIcon />}
            onClick={onOpenNewDM}
            sx={{ fontSize: '0.68rem', py: 0.5, borderColor: 'rgba(255, 0, 127, 0.4)' }}
          >
            + DM
          </Button>
        </Box>
      </Box>

      {/* Navigation Lists */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {/* CHANNELS SECTION */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, mb: 0.5 }}>
            <Typography variant="caption" className="glow-cyan" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
              CHANNELS ({channels.length})
            </Typography>
            <Tooltip title="Create Channel">
              <IconButton size="small" onClick={onOpenCreateGroup} sx={{ color: '#00f0ff' }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <List disablePadding>
            {channels.map((room) => {
              const isSelected = room.id === activeRoomId;
              const isOnline = contacts.some((c) => c.isOnline && room.members?.includes(c.id));
              const rawMsgText =
                room.lastMessageText ||
                (typeof room.lastMessage === 'string'
                  ? room.lastMessage
                  : room.lastMessage?.content || (room.lastMessage?.attachmentUrl ? '📷 Attachment' : ''));
              const lastMsgText = formatPreviewText(rawMsgText);

              return (
                <ListItem key={room.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => selectRoom(room.id)}
                    sx={{
                      borderRadius: 1,
                      py: 0.6,
                      px: 1.5,
                      borderLeft: isSelected ? '3px solid #00f0ff' : '3px solid transparent',
                      bgcolor: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.06)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: isSelected ? '#00f0ff' : '#94a3b8' }}>
                      <TagIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={renderSecondary(room, lastMsgText)}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#00f0ff' : '#cbd5e1',
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.72rem',
                        color: room.unread > 0 ? '#00f0ff' : '#64748b',
                        fontWeight: room.unread > 0 ? 600 : 400,
                        noWrap: true,
                      }}
                    />
                    {room.unread > 0 && (
                      <Badge
                        badgeContent={room.unread}
                        color="secondary"
                        sx={{ ml: 1, '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.1)', my: 1 }} />

        {/* DIRECT MESSAGES SECTION */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, mb: 0.5 }}>
            <Typography variant="caption" className="glow-pink" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
              DIRECT MESSAGES ({dms.length})
            </Typography>
            <Tooltip title="Start DM">
              <IconButton size="small" onClick={onOpenNewDM} sx={{ color: '#ff007f' }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <List disablePadding>
            {dms.map((room) => {
              const isSelected = room.id === activeRoomId;
              const contact = contacts.find((c) => c.name === room.name);
              const isOnline = contact ? contact.isOnline : room.isOnline;
              const rawMsgText =
                room.lastMessageText ||
                (typeof room.lastMessage === 'string'
                  ? room.lastMessage
                  : room.lastMessage?.content || (room.lastMessage?.attachmentUrl ? '📷 Attachment' : ''));
              const lastMsgText = formatPreviewText(rawMsgText);

              return (
                <ListItem key={room.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => selectRoom(room.id)}
                    sx={{
                      borderRadius: 1,
                      py: 0.6,
                      px: 1.5,
                      borderLeft: isSelected ? '3px solid #ff007f' : '3px solid transparent',
                      bgcolor: isSelected ? 'rgba(255, 0, 127, 0.12)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(255, 0, 127, 0.06)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: isOnline ? '#00ff66' : '#64748b',
                            boxShadow: isOnline ? '0 0 6px #00ff66' : 'none',
                          },
                        }}
                      >
                        <Avatar src={room.avatar} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: 24, height: 24 }} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={room.name}
                      secondary={renderSecondary(room, lastMsgText)}
                      primaryTypographyProps={{
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#ff007f' : '#cbd5e1',
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.72rem',
                        color: room.unread > 0 ? '#ff007f' : '#64748b',
                        fontWeight: room.unread > 0 ? 600 : 400,
                        noWrap: true,
                      }}
                    />
                    {room.unread > 0 && (
                      <Badge
                        badgeContent={room.unread}
                        color="secondary"
                        sx={{ ml: 1, '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </Box>
  );
};
