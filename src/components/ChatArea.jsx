import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  TextField,
  Button,
  Skeleton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  Tag as TagIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  Shortcut as ForwardIcon,
  FormatListBulleted as ListIcon,
  OpenInNew as OpenInNewIcon,
  ArrowBack as ArrowBackIcon,
  Terminal as TerminalIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { MessageInput } from './MessageInput';

export const ChatArea = ({ onToggleRightPanel, onBack, onOpenCreateGroup, onOpenNewDM }) => {
  const {
    rooms,
    activeRoom,
    messages,
    typingUsers,
    loadingMessages,
    loadingRooms,
    contacts,
    markRoomAsRead,
    setReplyingTo,
    editMessage,
    pinMessage,
    forwardMessage,
    deleteMessage,
    showToast,
  } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeMsg, setActiveMsg] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletingMsg, setDeletingMsg] = useState(null);
  const [forwardingMsg, setForwardingMsg] = useState(null);
  const [pinnedListOpen, setPinnedListOpen] = useState(false);
  const [activePinIndex, setActivePinIndex] = useState(0);

  const activeRoomContact = (contacts || []).find((c) => c.name === activeRoom?.name || activeRoom?.members?.includes(c.id));
  const activeRoomIsOnline = activeRoom?.type === 'dm'
    ? activeRoomContact?.isOnline ?? activeRoom?.isOnline
    : activeRoom?.isOnline;
  const activeRoomLastSeen = activeRoom?.type === 'dm'
    ? activeRoomContact?.lastSeen ?? activeRoom?.lastSeen ?? null
    : activeRoom?.lastSeen ?? null;
  const activeRoomHasLastSeen = activeRoomLastSeen && activeRoomLastSeen.toLowerCase() !== 'offline';

  const pinnedMessages = (messages || []).filter((m) => m.isPinned && !m.isDeleted && !m.isSystem && m.type !== 'system');
  // Last-In, First-Out (LIFO): Most recently pinned / newest transmissions appear first
  const latestFirstPinnedMessages = [...pinnedMessages].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
  const latestPinned = latestFirstPinnedMessages[0] || null;
  const currentPinnedMsg = latestFirstPinnedMessages[activePinIndex % (latestFirstPinnedMessages.length || 1)] || latestPinned;

  useEffect(() => {
    setActivePinIndex(0);
  }, [activeRoom?.id, pinnedMessages.length]);

  const jumpToMessage = (messageId) => {
    setPinnedListOpen(false);
    setTimeout(() => {
      const targetEl = document.getElementById(`msg-${messageId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.style.transition = 'all 0.4s ease';
        targetEl.style.boxShadow = '0 0 25px #00f0ff';
        targetEl.style.backgroundColor = 'rgba(0, 240, 255, 0.25)';
        setTimeout(() => {
          targetEl.style.boxShadow = '';
          targetEl.style.backgroundColor = '';
        }, 1800);
      }
    }, 100);
  };

  const handleOpenMenu = (event, msg) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMsg(msg);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers, loadingMessages]);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loadingRooms) {
    return (
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: '#07070c',
          p: 3,
          textAlign: 'center',
        }}
      >
        <CircularProgress size={44} sx={{ color: '#00f0ff', mb: 2 }} />
        <Typography variant="h6" className="glow-cyan" sx={{ fontWeight: 700, mb: 1, letterSpacing: '0.12em' }}>
          INITIALIZING SECURE LINK…
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b', letterSpacing: '0.05em' }}>
          Retrieving encrypted net channels and direct transmissions…
        </Typography>
      </Box>
    );
  }

  if (!activeRoom) {
    return (
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          bgcolor: '#07070c',
          p: { xs: 2, sm: 4 },
          textAlign: 'center',
        }}
      >
        <Box
          className="hud-card"
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            maxWidth: 480,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TerminalIcon
            sx={{
              fontSize: { xs: 48, sm: 60 },
              color: '#00f0ff',
              mb: 2,
              filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.6))',
            }}
          />
          <Typography
            variant="h6"
            className="glow-cyan"
            sx={{ fontWeight: 700, mb: 1, letterSpacing: '0.1em', fontSize: { xs: '1.15rem', sm: '1.35rem' } }}
          >
            WELCOME TO NEXUS GRID
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, fontSize: '0.85rem', lineHeight: 1.6 }}>
            No active transmission link. Connect with friends for direct messaging or initialize a group channel to get started.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, width: '100%', justifyContent: 'center' }}>
            {onOpenNewDM && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PersonAddIcon />}
                onClick={onOpenNewDM}
                sx={{
                  py: 1,
                  px: 2.5,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(45deg, #ff007f 0%, #d0006f 100%)',
                  boxShadow: '0 0 12px rgba(255, 0, 127, 0.4)',
                  '&:hover': {
                    boxShadow: '0 0 20px rgba(255, 0, 127, 0.7)',
                  },
                }}
              >
                + ADD FRIEND / START DM
              </Button>
            )}
            {onOpenCreateGroup && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<GroupAddIcon />}
                onClick={onOpenCreateGroup}
                sx={{
                  py: 1,
                  px: 2.5,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  borderColor: 'rgba(0, 240, 255, 0.5)',
                  color: '#00f0ff',
                  '&:hover': {
                    borderColor: '#00f0ff',
                    bgcolor: 'rgba(0, 240, 255, 0.1)',
                    boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                  },
                }}
              >
                + CREATE CHANNEL
              </Button>
            )}
          </Box>

          {contacts && contacts.length > 0 && (
            <Typography variant="caption" sx={{ color: '#00ff66', mt: 3, fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.05em' }}>
              ● {contacts.length} NETRUNNER{contacts.length > 1 ? 'S' : ''} AVAILABLE ON GRID
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box component="main" aria-label="Chat Main Stream" sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#07070c' }}>
      {/* Header Bar */}
      <Box
        className="hud-card"
        sx={{
          p: { xs: 1, sm: 1.5 },
          px: { xs: 1.5, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          bgcolor: '#0d0c1b',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
          {onBack && (
            <Tooltip title="Back to Channels">
              <IconButton
                size="small"
                onClick={onBack}
                sx={{
                  color: '#00f0ff',
                  display: { xs: 'inline-flex', md: 'none' },
                  mr: 0.5,
                  p: 0.5,
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                }}
                aria-label="Back to Channels"
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {activeRoom.type === 'channel' ? (
            <TagIcon sx={{ color: '#00f0ff', fontSize: { xs: 20, sm: 24 } }} />
          ) : (
            <Avatar src={activeRoom.avatar} imgProps={{ referrerPolicy: 'no-referrer' }} sx={{ width: { xs: 26, sm: 28 }, height: { xs: 26, sm: 28 }, border: '1px solid #ff007f' }} />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" className="glow-cyan" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' }, noWrap: true }}>
              {activeRoom.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', display: 'block', noWrap: true }}>
              {activeRoom.type === 'channel'
                ? `MEMBERS: ${activeRoom.members?.length || 1} NETRUNNERS`
                : activeRoomIsOnline
                  ? <Typography component="span" sx={{ color: '#00ff66', fontWeight: 700, fontSize: '0.75rem' }}>
                      ONLINE
                    </Typography>
                  : activeRoomHasLastSeen
                    ? `last seen ${activeRoomLastSeen}`
                    : 'OFFLINE'}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Toggle Room Info Panel">
          <IconButton size="small" onClick={onToggleRightPanel} aria-label="Toggle Room Info Panel" sx={{ color: '#00f0ff' }}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Pinned Messages Header Bar */}
      {pinnedMessages.length > 0 && (
        <Box
          sx={{
            bgcolor: 'rgba(0, 240, 255, 0.06)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
            px: { xs: 1.5, sm: 2.5 },
            py: 0.8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              overflow: 'hidden',
              flex: 1,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 0.85 },
            }}
            onClick={() => {
              if (currentPinnedMsg) {
                jumpToMessage(currentPinnedMsg.id);
                if (latestFirstPinnedMessages.length > 1) {
                  setActivePinIndex((prev) => (prev + 1) % latestFirstPinnedMessages.length);
                }
              }
            }}
          >
            <PushPinIcon sx={{ color: '#00f0ff', fontSize: 16, transform: 'rotate(45deg)' }} />
            <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {latestFirstPinnedMessages.length > 1
                ? `PINNED (${(activePinIndex % latestFirstPinnedMessages.length) + 1}/${latestFirstPinnedMessages.length}):`
                : 'PINNED:'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1', noWrap: true, maxWidth: { xs: 120, sm: 280, md: 450 } }}>
              {currentPinnedMsg?.senderName}: {currentPinnedMsg?.content || (currentPinnedMsg?.attachmentUrl ? '📷 Attachment' : 'Transmission')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              size="small"
              variant="text"
              startIcon={<ListIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => setPinnedListOpen(true)}
              sx={{
                fontSize: '0.7rem',
                color: '#00f0ff',
                py: 0.2,
                px: 0.8,
                minWidth: 'auto',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.15)', borderColor: '#00f0ff' },
              }}
            >
              {pinnedMessages.length > 1 ? `View All (${pinnedMessages.length})` : 'View Pin'}
            </Button>

            <Tooltip title="Unpin This Transmission">
              <IconButton
                size="small"
                onClick={() => {
                  if (currentPinnedMsg) {
                    pinMessage(currentPinnedMsg.id, false);
                  }
                }}
                sx={{ color: '#94a3b8', '&:hover': { color: '#ff007f' } }}
              >
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Messages Stream */}
      <Box role="log" aria-live="polite" aria-label="Message Stream" sx={{ flex: 1, width: '100%', overflowY: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loadingMessages ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Skeleton variant="rounded" width="40%" height={50} sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)' }} />
            <Skeleton variant="rounded" width="55%" height={60} sx={{ bgcolor: 'rgba(255, 0, 127, 0.1)', alignSelf: 'flex-end' }} />
            <Skeleton variant="rounded" width="45%" height={50} sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)' }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ margin: 'auto', textAlign: 'center', opacity: 0.6 }}>
            <Typography variant="body2" className="glow-cyan">
              --- END OF STREAM LOG ---
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              No previous transmissions recorded in this node.
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem || msg.type === 'system') {
              const currentUserId = user?.id || 'usr_netrunner_01';
              const isPinnerMe = Boolean(
                (msg.pinnerId && msg.pinnerId === currentUserId) ||
                (msg.senderId && msg.senderId === currentUserId) ||
                msg.pinnerName === 'YOU' ||
                (msg.pinnerName && user?.name && msg.pinnerName === user.name) ||
                (!msg.pinnerId && !msg.senderId && msg.content?.startsWith('You'))
              );

              let displayText = msg.content || '';
              const pinnerDisplayName = isPinnerMe ? 'You' : (msg.pinnerName || msg.senderName || 'Someone');

              if (msg.snippet) {
                const action = msg.isPinned === false ? 'unpinned' : 'pinned';
                displayText = `${pinnerDisplayName} ${action} the message "${msg.snippet}"`;
              } else if (displayText) {
                if (isPinnerMe && !displayText.startsWith('You')) {
                  displayText = displayText.replace(/^[^\s]+ (pinned|unpinned)/, 'You $1');
                } else if (!isPinnerMe && displayText.startsWith('You')) {
                  displayText = displayText.replace(/^You (pinned|unpinned)/, `${pinnerDisplayName} $1`);
                }
              } else {
                const action = msg.isPinned === false ? 'unpinned' : 'pinned';
                displayText = `${pinnerDisplayName} ${action} the message`;
              }

              return (
                <Box
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    my: 1,
                  }}
                >
                  <Box
                    onClick={() => {
                      if (msg.pinnedMessageId) {
                        jumpToMessage(msg.pinnedMessageId);
                      }
                    }}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.8,
                      bgcolor: 'rgba(0, 240, 255, 0.07)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      borderRadius: '16px',
                      px: 2,
                      py: 0.5,
                      cursor: msg.pinnedMessageId ? 'pointer' : 'default',
                      transition: 'all 0.2s ease',
                      '&:hover': msg.pinnedMessageId ? {
                        bgcolor: 'rgba(0, 240, 255, 0.15)',
                        borderColor: '#00f0ff',
                        boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
                      } : {},
                    }}
                  >
                    <PushPinIcon sx={{ color: '#00f0ff', fontSize: 14, transform: 'rotate(45deg)' }} />
                    <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 600, fontSize: '0.75rem' }}>
                      {displayText}
                    </Typography>
                  </Box>
                </Box>
              );
            }

            const currentUserId = user?.id || 'usr_netrunner_01';
            const isMe = msg.senderId === currentUserId;
            const otherContact = (contacts || []).find((c) => c.name === activeRoom.name || activeRoom.members?.includes(c.id));
            const isRecipientOnline = activeRoom.type === 'dm'
              ? (otherContact ? otherContact.isOnline : activeRoom.isOnline)
              : (contacts || []).some((c) => c.isOnline && activeRoom.members?.includes(c.id));
            const isRead = Boolean(
              msg.isRead ||
              (msg.readReceipts && msg.readReceipts.some((id) => id !== msg.senderId))
            );

            return (
              <Box
                key={msg.id}
                id={`msg-${msg.id}`}
                sx={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                  p: 0.5,
                  borderRadius: 2,
                  transition: 'background-color 0.3s ease',
                  '&:hover .msg-more-btn': { opacity: 1 },
                }}
              >
                <Avatar
                  src={msg.senderAvatar || msg.sender?.avatarUrl}
                  alt={msg.senderName || msg.sender?.name}
                  imgProps={{ referrerPolicy: 'no-referrer' }}
                  sx={{ width: { xs: 28, sm: 34 }, height: { xs: 28, sm: 34 }, border: isMe ? '1px solid #00f0ff' : '1px solid #ff007f' }}
                />

                <Box
                  sx={{
                    maxWidth: { xs: '88%', sm: '80%', md: '70%' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.3,
                      justifyContent: isMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: isMe ? '#00f0ff' : '#ff007f', fontSize: '0.75rem' }}
                    >
                      {isMe ? 'YOU' : msg.senderName || msg.sender?.name || 'Netrunner'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                      {formatTime(msg.createdAt)}
                    </Typography>
                  </Box>

                  {/* Message Bubble */}
                  <Box
                    className="hud-card"
                    sx={{
                      width: 'fit-content',
                      maxWidth: '100%',
                      p: 1.5,
                      borderRadius: 2,
                      wordBreak: 'break-word',
                      bgcolor: msg.isDeleted
                        ? 'rgba(100, 116, 139, 0.06)'
                        : isMe ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 0, 127, 0.08)',
                      borderColor: msg.isDeleted
                        ? 'rgba(100, 116, 139, 0.25)'
                        : msg.isPinned
                          ? '#00f0ff'
                          : isMe ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 127, 0.3)',
                      borderStyle: msg.isDeleted ? 'dashed' : 'solid',
                      boxShadow: msg.isPinned ? '0 0 10px rgba(0, 240, 255, 0.2)' : 'none',
                    }}
                  >
                    {msg.isDeleted ? (
                      /* ── Deleted notice shown to everyone ── */
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748b',
                            fontStyle: 'italic',
                            fontSize: '0.82rem',
                            userSelect: 'none',
                          }}
                        >
                          🚫 This message was deleted
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {/* Pinned / Forwarded Indicators */}
                        {(msg.isPinned || msg.isForwarded || msg.forwardedFrom) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.8 }}>
                            {msg.isPinned && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}>
                                <PushPinIcon sx={{ fontSize: 13, color: '#00f0ff', transform: 'rotate(45deg)' }} />
                                <Typography variant="caption" sx={{ color: '#00f0ff', fontSize: '0.68rem', fontWeight: 700 }}>
                                  PINNED
                                </Typography>
                              </Box>
                            )}
                            {(msg.isForwarded || msg.forwardedFrom) && (() => {
                              let fwdData = msg.forwardedFrom;
                              if (typeof fwdData === 'string') {
                                try {
                                  fwdData = JSON.parse(fwdData);
                                } catch {
                                  fwdData = { senderName: msg.forwardedFrom };
                                }
                              }
                              const fwdSenderName = fwdData?.senderName || 'Netrunner';
                              const fwdSenderAvatar = fwdData?.senderAvatar || null;

                              return (
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.6,
                                    bgcolor: 'rgba(0, 240, 255, 0.08)',
                                    px: 0.8,
                                    py: 0.3,
                                    borderRadius: '4px',
                                    border: '1px solid rgba(0, 240, 255, 0.15)',
                                  }}
                                >
                                  <ForwardIcon sx={{ fontSize: 13, color: '#00f0ff', transform: 'scaleX(-1)' }} />
                                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                                    Forwarded from
                                  </Typography>
                                  {fwdSenderAvatar && (
                                    <Avatar
                                      src={fwdSenderAvatar}
                                      alt={fwdSenderName}
                                      imgProps={{ referrerPolicy: 'no-referrer' }}
                                      sx={{ width: 16, height: 16, border: '1px solid #00f0ff' }}
                                    />
                                  )}
                                  <Typography
                                    variant="caption"
                                    sx={{ color: '#00f0ff', fontWeight: 700, fontSize: '0.68rem' }}
                                  >
                                    {fwdSenderName}
                                  </Typography>
                                </Box>
                              );
                            })()}
                          </Box>
                        )}

                        {/* Quoted Reply Banner */}
                        {msg.replyTo && (() => {
                          let replyData = msg.replyTo;
                          if (typeof replyData === 'string') {
                            try {
                              replyData = JSON.parse(replyData);
                            } catch {
                              replyData = { content: msg.replyTo };
                            }
                          }
                          if (!replyData) return null;

                          const isReplyingToMe =
                            replyData.senderId === user?.id ||
                            (user?.name && replyData.senderName === user.name) ||
                            replyData.senderName === 'YOU';

                          const senderDisplayName = isReplyingToMe ? 'YOU' : (replyData.senderName || 'Netrunner');
                          const replyContent = replyData.content || (replyData.attachmentUrl ? '📷 Attachment' : 'Quoted Message');

                          return (
                            <Box
                              sx={{
                                borderLeft: '3px solid #00f0ff',
                                bgcolor: 'rgba(0, 240, 255, 0.1)',
                                p: 1,
                                mb: 1,
                                borderRadius: '0 4px 4px 0',
                                cursor: replyData.id ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                '&:hover': replyData.id ? {
                                  bgcolor: 'rgba(0, 240, 255, 0.18)',
                                  transform: 'translateX(2px)',
                                } : {},
                              }}
                              onClick={() => {
                                if (replyData.id) {
                                  const targetEl = document.getElementById(`msg-${replyData.id}`);
                                  if (targetEl) {
                                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    targetEl.style.backgroundColor = 'rgba(0, 240, 255, 0.25)';
                                    setTimeout(() => {
                                      targetEl.style.backgroundColor = '';
                                    }, 1600);
                                  }
                                }
                              }}
                            >
                              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 700, display: 'block', fontSize: '0.72rem' }}>
                                Replying to {senderDisplayName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.72rem', noWrap: true, display: 'block', maxWidth: 320 }}>
                                {replyContent}
                              </Typography>
                            </Box>
                          );
                        })()}

                        {msg.content && (
                          <Typography variant="body2" sx={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {msg.content}
                            {msg.isEdited && (
                              <Typography component="span" variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', ml: 1 }}>
                                (edited)
                              </Typography>
                            )}
                          </Typography>
                        )}

                        {/* Inline Image Attachment Preview */}
                        {msg.attachmentUrl && (
                          <Box sx={{ mt: msg.content ? 1.5 : 0 }}>
                            {msg.attachmentUrl.match(/\.(jpg|jpeg|png|webp|gif)/i) || msg.attachmentUrl.startsWith('blob:') || msg.attachmentUrl.includes('images.unsplash.com') || msg.attachmentUrl.includes('/uploads/') ? (
                              <Box
                                component="img"
                                src={msg.attachmentUrl}
                                alt="Attachment"
                                onClick={() => setSelectedImage(msg.attachmentUrl)}
                                sx={{
                                  maxWidth: '100%',
                                  maxHeight: 250,
                                  borderRadius: 1,
                                  border: '1px solid #00f0ff',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.02)', boxShadow: '0 0 12px #00f0ff' },
                                }}
                              />
                            ) : (
                              <Box
                                component="a"
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: '#00f0ff', fontSize: '0.8rem', textDecoration: 'underline' }}
                              >
                                📁 View Attachment Document
                              </Box>
                            )}
                          </Box>
                        )}

                        {/* Read Receipts Checkmark */}
                        {isMe && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                            {isRead ? (
                              <Tooltip title="Read (Double Green Tick)">
                                <DoneAllIcon
                                  data-testid="double-green-tick"
                                  aria-label="Read double green tick"
                                  sx={{
                                    color: '#00ff66',
                                    fontSize: 16,
                                    filter: 'drop-shadow(0 0 4px #00ff66)',
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Sent (Double Tick)">
                                <DoneAllIcon
                                  data-testid="double-grey-tick"
                                  aria-label="Unread double tick"
                                  sx={{ color: '#94a3b8', fontSize: 16 }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Box>

                {/* More Options Icon Button — hidden for deleted messages */}
                {!msg.isDeleted && (
                  <Box className="msg-more-btn" sx={{ alignSelf: 'center', opacity: { xs: 0.85, md: 0.7 }, transition: 'opacity 0.2s' }}>
                    <Tooltip title="Message Options">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, msg)}
                        aria-label="Message options (...)"
                        sx={{ color: '#94a3b8', '&:hover': { color: '#00f0ff', bgcolor: 'rgba(0, 240, 255, 0.1)' } }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            );
          })
        )}

        {/* Real-time Typing Indicator HUD */}
        {typingUsers.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5 }}>
            <Typography variant="caption" className="glow-cyan" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.4 }}>
              <Box className="typing-dot" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#00f0ff' }} />
              <Box className="typing-dot" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#00f0ff' }} />
              <Box className="typing-dot" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#00f0ff' }} />
            </Box>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Composer */}
      <MessageInput />

      {/* Message Options Dropdown Menu (...) */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          className: 'hud-card',
          sx: { mt: 0.5, minWidth: 160 },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activeMsg) {
              setReplyingTo({
                id: activeMsg.id,
                senderId: activeMsg.senderId,
                senderName: activeMsg.senderId === user?.id
                  ? (user?.name || 'YOU')
                  : (activeMsg.senderName || activeMsg.sender?.name || 'Netrunner'),
                content: activeMsg.content || (activeMsg.attachmentUrl ? '📷 Attachment' : ''),
                attachmentUrl: activeMsg.attachmentUrl || null,
              });
            }
            handleCloseMenu();
          }}
          sx={{ color: '#00f0ff', gap: 1, fontSize: '0.8rem' }}
        >
          <ReplyIcon fontSize="small" /> Reply
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeMsg) {
              const textToCopy = activeMsg.content || activeMsg.attachmentUrl || '';
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(textToCopy);
              }
              showToast?.('message copied to clipboard', 'info');
            }
            handleCloseMenu();
          }}
          sx={{ color: '#00f0ff', gap: 1, fontSize: '0.8rem' }}
        >
          <ContentCopyIcon fontSize="small" /> Copy Text
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeMsg) setForwardingMsg(activeMsg);
            handleCloseMenu();
          }}
          sx={{ color: '#00f0ff', gap: 1, fontSize: '0.8rem' }}
        >
          <ForwardIcon fontSize="small" sx={{ transform: 'scaleX(-1)' }} /> Forward
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeMsg) pinMessage(activeMsg.id, !activeMsg.isPinned);
            handleCloseMenu();
          }}
          sx={{ color: '#00f0ff', gap: 1, fontSize: '0.8rem' }}
        >
          {activeMsg?.isPinned ? <PushPinOutlinedIcon fontSize="small" /> : <PushPinIcon fontSize="small" />}
          {activeMsg?.isPinned ? 'Unpin' : 'Pin'}
        </MenuItem>

        {activeMsg?.senderId === (user?.id || 'usr_netrunner_01') && (
          <MenuItem
            onClick={() => {
              if (activeMsg) {
                setEditingMsg(activeMsg);
                setEditText(activeMsg.content || '');
              }
              handleCloseMenu();
            }}
            sx={{ color: '#ffe600', gap: 1, fontSize: '0.8rem' }}
          >
            <EditIcon fontSize="small" /> Edit
          </MenuItem>
        )}

        {(activeMsg?.senderId === (user?.id || 'usr_netrunner_01') || activeRoom.type === 'channel') && (
          <MenuItem
            onClick={() => {
              if (activeMsg) setDeletingMsg(activeMsg);
              handleCloseMenu();
            }}
            sx={{ color: '#ff007f', gap: 1, fontSize: '0.8rem' }}
          >
            <DeleteIcon fontSize="small" /> Delete
          </MenuItem>
        )}
      </Menu>

      {/* Forward Message Dialog */}
      <Dialog
        open={Boolean(forwardingMsg)}
        onClose={() => setForwardingMsg(null)}
        PaperProps={{ className: 'hud-card', sx: { p: 2, minWidth: 360, maxWidth: 440 } }}
      >
        <DialogTitle className="glow-cyan" sx={{ fontWeight: 700, pb: 1 }}>
          FORWARD MESSAGE
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', mb: 1.5, display: 'block' }}>
            Select a channel or direct message node to forward this message:
          </Typography>
          <Box
            sx={{
              p: 1.2,
              mb: 2,
              bgcolor: 'rgba(0, 240, 255, 0.06)',
              borderRadius: 1,
              borderLeft: '3px solid #00f0ff',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
            }}
          >
            {(forwardingMsg?.senderAvatar || forwardingMsg?.sender?.avatarUrl) && (
              <Avatar
                src={forwardingMsg?.senderAvatar || forwardingMsg?.sender?.avatarUrl}
                alt={forwardingMsg?.senderName || 'Sender'}
                imgProps={{ referrerPolicy: 'no-referrer' }}
                sx={{ width: 32, height: 32, border: '1px solid #00f0ff' }}
              />
            )}
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 700, display: 'block' }}>
                {forwardingMsg?.senderName || forwardingMsg?.sender?.name || 'Netrunner'}:
              </Typography>
              <Typography variant="caption" sx={{ color: '#cbd5e1', noWrap: true, display: 'block' }}>
                {forwardingMsg?.content || (forwardingMsg?.attachmentUrl ? '📷 Attachment' : '')}
              </Typography>
            </Box>
          </Box>
          <List sx={{ maxHeight: 260, overflowY: 'auto', p: 0 }}>
            {(rooms || []).map((r) => (
              <ListItem key={r.id} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton
                  onClick={() => {
                    if (forwardingMsg) {
                      forwardMessage(forwardingMsg, r.id);
                      setForwardingMsg(null);
                    }
                  }}
                  sx={{
                    borderRadius: 1,
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.15)', borderColor: '#00f0ff' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {r.type === 'channel' ? (
                      <TagIcon sx={{ color: '#00f0ff', fontSize: 20 }} />
                    ) : (
                      <Avatar src={r.avatar} sx={{ width: 24, height: 24, border: '1px solid #ff007f' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={r.name}
                    primaryTypographyProps={{ sx: { color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600 } }}
                    secondary={r.type === 'channel' ? 'Channel' : 'Direct Message'}
                    secondaryTypographyProps={{ sx: { color: '#64748b', fontSize: '0.7rem' } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 1 }}>
          <Button onClick={() => setForwardingMsg(null)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Message Dialog Box */}
      <Dialog
        open={Boolean(editingMsg)}
        onClose={() => setEditingMsg(null)}
        PaperProps={{ className: 'hud-card', sx: { p: 2, minWidth: 360 } }}
      >
        <DialogTitle className="glow-cyan" sx={{ fontWeight: 700 }}>
          EDIT TRANSMISSION
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditingMsg(null)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (editingMsg && editText.trim()) {
                editMessage(editingMsg.id, editText.trim());
                setEditingMsg(null);
              }
            }}
          >
            Save Edit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog Box */}
      <Dialog
        open={Boolean(deletingMsg)}
        onClose={() => setDeletingMsg(null)}
        PaperProps={{ className: 'hud-card', sx: { p: 2, minWidth: 320 } }}
      >
        <DialogTitle className="glow-pink" sx={{ fontWeight: 700 }}>
          DELETE TRANSMISSION
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#cbd5e1', mt: 1 }}>
            Are you sure you want to delete this transmission? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeletingMsg(null)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              if (deletingMsg) {
                deleteMessage(deletingMsg.id);
                setDeletingMsg(null);
              }
            }}
            sx={{ bgcolor: '#ff007f', '&:hover': { bgcolor: '#d00068' } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Lightbox Modal */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        PaperProps={{ className: 'hud-card', sx: { p: 1, bgcolor: '#000' } }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#ff007f', bgcolor: 'rgba(0,0,0,0.6)' }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={selectedImage || ''}
            alt="Enlarged preview"
            sx={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', borderRadius: 1 }}
          />
        </Box>
      </Dialog>
      {/* Pinned Messages List Modal */}
      <Dialog
        open={pinnedListOpen}
        onClose={() => setPinnedListOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: 'hud-card',
          sx: { p: 2, bgcolor: '#0c0b18', border: '1px solid #00f0ff', boxShadow: '0 0 25px rgba(0, 240, 255, 0.2)' },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            pb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PushPinIcon sx={{ color: '#00f0ff', transform: 'rotate(45deg)' }} />
            <Typography variant="h6" className="glow-cyan" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
              PINNED TRANSMISSIONS ({pinnedMessages.length})
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setPinnedListOpen(false)} sx={{ color: '#ff007f' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 1, maxHeight: 420, overflowY: 'auto' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', mb: 2, display: 'block' }}>
            All pinned transmissions in #{activeRoom?.name || 'room'}:
          </Typography>

          {pinnedMessages.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', py: 4 }}>
              No transmissions currently pinned in this node.
            </Typography>
          ) : (
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {latestFirstPinnedMessages.map((msg, index) => (
                <Box
                  key={msg.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(0, 240, 255, 0.04)',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 240, 255, 0.08)',
                      borderColor: '#00f0ff',
                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        imgProps={{ referrerPolicy: 'no-referrer' }}
                        sx={{ width: 26, height: 26, border: '1px solid #00f0ff' }}
                      />
                      <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 700 }}>
                        {msg.senderId === user?.id ? 'YOU' : msg.senderName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem' }}>
                        {formatTime(msg.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: index === 0 ? '#00f0ff' : '#94a3b8', fontSize: '0.68rem', bgcolor: index === 0 ? 'rgba(0, 240, 255, 0.18)' : 'rgba(0, 240, 255, 0.08)', px: 0.8, py: 0.2, borderRadius: '4px', fontWeight: index === 0 ? 700 : 500 }}>
                      {index === 0 ? '#1 (Latest)' : `#${index + 1}`}
                    </Typography>
                  </Box>

                  {/* Message Body Snippet */}
                  {msg.content && (
                    <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.82rem', mb: 1, whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Typography>
                  )}

                  {/* Image Attachment Preview */}
                  {msg.attachmentUrl && (
                    <Box sx={{ mb: 1 }}>
                      <Box
                        component="img"
                        src={msg.attachmentUrl}
                        alt="Pinned attachment"
                        onClick={() => setSelectedImage(msg.attachmentUrl)}
                        sx={{
                          maxHeight: 120,
                          maxWidth: 200,
                          borderRadius: 1,
                          objectFit: 'cover',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          cursor: 'pointer',
                          '&:hover': { border: '1px solid #ff007f' },
                        }}
                      />
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 0.5, pt: 0.5, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                      onClick={() => jumpToMessage(msg.id)}
                      sx={{
                        fontSize: '0.7rem',
                        py: 0.3,
                        px: 1,
                        color: '#00f0ff',
                        borderColor: 'rgba(0, 240, 255, 0.4)',
                        '&:hover': { borderColor: '#00f0ff', bgcolor: 'rgba(0, 240, 255, 0.1)' },
                      }}
                    >
                      Jump to Message
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<PushPinOutlinedIcon sx={{ fontSize: '13px !important', transform: 'rotate(45deg)' }} />}
                      onClick={() => pinMessage(msg.id, false)}
                      sx={{
                        fontSize: '0.7rem',
                        py: 0.3,
                        px: 1,
                        color: '#ff007f',
                        '&:hover': { bgcolor: 'rgba(255, 0, 127, 0.1)' },
                      }}
                    >
                      Unpin
                    </Button>
                  </Box>
                </Box>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 1.5, pt: 1, borderTop: '1px solid rgba(0, 240, 255, 0.15)', justifyContent: 'space-between' }}>
          {pinnedMessages.length > 1 ? (
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => {
                pinnedMessages.forEach((m) => pinMessage(m.id, false));
                setPinnedListOpen(false);
              }}
              sx={{ fontSize: '0.75rem', borderColor: 'rgba(255, 0, 127, 0.5)', color: '#ff007f' }}
            >
              Unpin All ({pinnedMessages.length})
            </Button>
          ) : <Box />}
          <Button
            size="small"
            variant="contained"
            onClick={() => setPinnedListOpen(false)}
            sx={{ bgcolor: '#00f0ff', color: '#000', fontWeight: 700, fontSize: '0.75rem' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

