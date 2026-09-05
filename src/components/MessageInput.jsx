import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  Typography,
  Paper,
  InputAdornment,
  Tooltip,
  Popover,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  Reply as ReplyIcon,
  InsertEmoticon as EmojiIcon,
} from '@mui/icons-material';
import { useChat } from '../context/ChatContext';

const EMOJI_CATEGORIES = [
  {
    name: 'SMILEYS',
    icon: '😃',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '🥺', '😢', '😭', '😤', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '🤖', '👾', '💀', '👻', '👽'],
  },
  {
    name: 'HANDS',
    icon: '👍',
    emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🖐️', '🖖', '👊', '✊', '🤛', '🤜', '🦾', '👋'],
  },
  {
    name: 'CYBER',
    icon: '⚡',
    emojis: ['⚡', '💻', '🖥️', '📱', '💾', '💿', '🕹️', '🎮', '📡', '🔋', '🔌', '💡', '⚙️', '🔧', '🛡️', '⚔️', '💣', '🔮', '🚀', '🛸', '🛰️', '🕶️', '🌐', '🧬', '☣️', '☢️', '⚠️'],
  },
  {
    name: 'VIBES',
    icon: '🔥',
    emojis: ['🔥', '💯', '✨', '⭐', '🌟', '💫', '💥', '💢', '🎉', '🏆', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❤️‍🔥', '💖', '☕', '🍕', '🍻', '🍸', '✔️', '❌', '❗'],
  },
];

export const MessageInput = () => {
  const { sendMessage, emitTyping, uploadFileToS3, showToast, replyingTo, setReplyingTo } = useChat();
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState(null); // { url, name, file }
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [activeEmojiTab, setActiveEmojiTab] = useState(0);
  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const inputRef = useRef(null);

  const handleOpenEmoji = (e) => {
    setEmojiAnchorEl(e.currentTarget);
  };

  const handleCloseEmoji = () => {
    setEmojiAnchorEl(null);
  };

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    if (input && typeof input.selectionStart === 'number') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const nextText = text.slice(0, start) + emoji + text.slice(end);
      setText(nextText);
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + emoji.length;
        input.focus();
      }, 0);
    } else {
      setText((prev) => prev + emoji);
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Emit typing indicator
    emitTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get presigned URL and upload to S3 / Mock endpoint
      const publicUrl = await uploadFileToS3(file);
      setAttachment({
        url: publicUrl,
        name: file.name,
        type: file.type,
      });
    } catch (err) {
      console.error('File upload error:', err);
      // Local fallback for quick preview if endpoint fails
      const fallbackUrl = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : 'blob:local-preview';
      setAttachment({
        url: fallbackUrl,
        name: file.name,
        type: file.type,
      });
      showToast?.('Attachment upload failed. Using local preview instead.', 'warning');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSend = () => {
    if (!text.trim() && !attachment) return;

    sendMessage({
      content: text.trim(),
      attachmentUrl: attachment?.url || null,
    });

    setText('');
    setAttachment(null);
    emitTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#0b0a16', borderTop: '1px solid rgba(0, 240, 255, 0.2)', width: '100%' }}>
      {/* Replying To Banner Preview */}
      {replyingTo && (
        <Paper
          className="hud-card"
          sx={{
            p: 1,
            px: 1.5,
            mb: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderColor: '#00f0ff',
            bgcolor: 'rgba(0, 240, 255, 0.08)',
            borderRadius: 1,
            borderLeft: '3px solid #00f0ff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <ReplyIcon sx={{ color: '#00f0ff', fontSize: 18 }} />
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 700, display: 'block' }}>
                REPLYING TO {replyingTo.senderName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.72rem', noWrap: true, display: 'block' }}>
                {replyingTo.content}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setReplyingTo(null)} sx={{ color: '#ff007f' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}
      {/* File Attachment Thumbnail Preview */}
      {attachment && (
        <Paper
          className="hud-card"
          sx={{
            p: 1,
            mb: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.5,
            borderColor: '#00f0ff',
            borderRadius: 1,
          }}
        >
          {attachment.type?.startsWith('image/') || attachment.url.match(/\.(jpg|png|webp|gif)/i) || attachment.url.includes('/uploads/') ? (
            <Box
              component="img"
              src={attachment.url}
              alt="Preview"
              sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, border: '1px solid #00f0ff' }}
            />
          ) : (
            <ImageIcon sx={{ color: '#00f0ff', fontSize: 36 }} />
          )}
          <Box>
            <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 700, display: 'block' }}>
              ATTACHMENT_READY
            </Typography>
            <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '0.75rem', maxWidth: 200, noWrap: true }}>
              {attachment.name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setAttachment(null)} sx={{ color: '#ff007f' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      {/* Input Field, File Picker & Emoji Popover */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,application/pdf"
        />

        <Tooltip title="Attach File / Image (S3 Upload)">
          <span>
            <IconButton
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach file"
              sx={{
                color: '#00f0ff',
                p: { xs: 0.8, sm: 1 },
                bgcolor: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.2)' },
              }}
            >
              {uploading ? <CircularProgress size={20} sx={{ color: '#00f0ff' }} /> : <AttachFileIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Insert Emoji">
          <IconButton
            onClick={handleOpenEmoji}
            aria-label="Insert emoji"
            sx={{
              color: Boolean(emojiAnchorEl) ? '#ff007f' : '#00f0ff',
              p: { xs: 0.8, sm: 1 },
              bgcolor: Boolean(emojiAnchorEl) ? 'rgba(255, 0, 127, 0.15)' : 'rgba(0, 240, 255, 0.08)',
              border: Boolean(emojiAnchorEl) ? '1px solid #ff007f' : '1px solid rgba(0, 240, 255, 0.3)',
              '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.2)' },
            }}
          >
            <EmojiIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <TextField
          fullWidth
          multiline
          inputRef={inputRef}
          maxRows={3}
          placeholder="TRANSMIT_MESSAGE..."
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
            },
          }}
        />

        <IconButton
          color="primary"
          onClick={handleSend}
          aria-label="Send message"
          disabled={!text.trim() && !attachment}
          sx={{
            p: { xs: 0.8, sm: 1 },
            bgcolor: text.trim() || attachment ? '#00f0ff' : 'rgba(0, 240, 255, 0.1)',
            color: text.trim() || attachment ? '#000' : 'rgba(0, 240, 255, 0.3)',
            boxShadow: text.trim() || attachment ? '0 0 12px #00f0ff' : 'none',
            '&:hover': {
              bgcolor: '#00d0e0',
            },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Cyberpunk Emoji Picker Popover */}
      <Popover
        open={Boolean(emojiAnchorEl)}
        anchorEl={emojiAnchorEl}
        onClose={handleCloseEmoji}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          className: 'hud-card',
          sx: {
            width: { xs: 290, sm: 340 },
            maxHeight: 330,
            bgcolor: '#0d0c1b',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.25)',
            p: 1,
            mb: 1,
            backgroundImage: 'none',
          },
        }}
      >
        <Box sx={{ borderBottom: '1px solid rgba(0, 240, 255, 0.2)', mb: 1 }}>
          <Tabs
            value={activeEmojiTab}
            onChange={(_, val) => setActiveEmojiTab(val)}
            variant="fullWidth"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: '1rem', minWidth: 40 },
              '& .MuiTabs-indicator': { bgcolor: '#00f0ff' },
            }}
          >
            {EMOJI_CATEGORIES.map((cat) => (
              <Tab key={cat.name} label={cat.icon} title={cat.name} />
            ))}
          </Tabs>
        </Box>

        <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 700, px: 0.5, mb: 0.8, display: 'block', fontSize: '2rem', letterSpacing: '0.08em' }}>
          {EMOJI_CATEGORIES[activeEmojiTab]?.name}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            maxHeight: 210,
            overflowY: 'auto',
            p: 0.5,
          }}
        >
          {EMOJI_CATEGORIES[activeEmojiTab]?.emojis.map((emoji, idx) => (
            <IconButton
              key={`${emoji}-${idx}`}
              onClick={() => handleEmojiSelect(emoji)}
              size="small"
              sx={{
                fontSize: '1.25rem',
                p: 0.6,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 240, 255, 0.15)',
                  transform: 'scale(1.2)',
                  transition: 'transform 0.15s',
                },
              }}
            >
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};
