import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";
import { roomsApi, usersApi, messagesApi, uploadApi } from "../app/NexApi";

const ChatContext = createContext(null);

export const MOCK_TEST_ROOMS = [
  {
    id: "room_cyber_main",
    name: "general-grid",
    type: "channel",
    unread: 0,
    icon: "#",
    members: ["usr_netrunner_01", "usr_alt_2", "usr_silverhand"],
  },
  {
    id: "room_dev_ops",
    name: "icebreakers-chat",
    type: "channel",
    unread: 0,
    icon: "#",
    members: ["usr_netrunner_01", "usr_alt_2"],
  },
  {
    id: "room_dm_alt",
    name: "Alt_Cunningham",
    type: "dm",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    isOnline: true,
    members: ["usr_netrunner_01", "usr_alt_2"],
  },
  {
    id: "room_dm_silverhand",
    name: "Johnny_Silverhand",
    type: "dm",
    unread: 0,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isOnline: false,
    lastSeenAt: new Date(Date.now() - 10 * 60000).toISOString(),
    lastSeen: "10m ago",
    members: ["usr_netrunner_01", "usr_silverhand"],
  },
];

const formatLastSeenAt = (lastSeenAt) => {
  if (!lastSeenAt) return "OFFLINE";

  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "1d ago" : `${diffDays}d ago`;
};

const mergeAndDedupeRooms = (existingRooms = [], newRooms = []) => {
  const roomMap = new Map();

  for (const r of [...existingRooms, ...newRooms]) {
    if (!r || !r.name) continue;
    const key =
      r.type === "dm"
        ? `dm_${(r.name || "").toLowerCase()}`
        : `channel_${(r.name || "").toLowerCase()}`;

    if (!roomMap.has(key)) {
      roomMap.set(key, r);
    } else {
      const current = roomMap.get(key);
      const isCurrentMock = String(current.id).startsWith("room_");
      const isNewMock = String(r.id).startsWith("room_");

      if (isCurrentMock && !isNewMock) {
        roomMap.set(key, { ...current, ...r });
      } else {
        roomMap.set(key, { ...r, ...current });
      }
    }
  }

  return Array.from(roomMap.values());
};

export const MOCK_TEST_MESSAGES = {
  room_cyber_main: [
    {
      id: "m1",
      roomId: "room_cyber_main",
      senderId: "usr_alt_2",
      senderName: "Alt_Cunningham",
      senderAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      content: "Welcome to the Nexus Netroom. Connection is secure.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      readReceipts: ["usr_netrunner_01"],
    },
    {
      id: "m2",
      roomId: "room_cyber_main",
      senderId: "usr_silverhand",
      senderName: "Johnny_Silverhand",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      content: "Check out the new HUD blueprint schematic attachment:",
      attachmentUrl:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      readReceipts: ["usr_netrunner_01"],
    },
  ],
  room_dm_alt: [
    {
      id: "m3",
      roomId: "room_dm_alt",
      senderId: "usr_alt_2",
      senderName: "Alt_Cunningham",
      senderAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      content: "Are you ready for the data extraction run?",
      createdAt: new Date(Date.now() - 900000).toISOString(),
      readReceipts: [],
    },
  ],
};

export const MOCK_TEST_CONTACTS = [
  {
    id: "usr_alt_2",
    name: "Alt_Cunningham",
    email: "alt@ghost.net",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    isOnline: true,
    lastSeenAt: null,
    lastSeen: "Online",
  },
  {
    id: "usr_silverhand",
    name: "Johnny_Silverhand",
    email: "johnny@samurai.band",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isOnline: false,
    lastSeenAt: new Date(Date.now() - 10 * 60000).toISOString(),
    lastSeen: "10m ago",
  },
  {
    id: "usr_judy",
    name: "Judy_Alvarez",
    email: "judy@mox.city",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isOnline: true,
    lastSeenAt: null,
    lastSeen: "Online",
  },
  {
    id: "usr_jackie",
    name: "Jackie_Welles",
    email: "jackie@heywood.org",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isOnline: false,
    lastSeenAt: new Date(Date.now() - 60 * 60000).toISOString(),
    lastSeen: "1h ago",
  },
];

export const ChatProvider = ({
  children,
  initialRooms = [],
  initialActiveRoomId = null,
  initialMessages = {},
  initialContacts = [],
}) => {
  const { socket, connected } = useSocket();
  const { user, token, updateProfile } = useAuth();

  const [rooms, setRooms] = useState(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState(
    initialActiveRoomId || (initialRooms[0]?.id || null)
  );
  const [messages, setMessages] = useState(initialMessages);
  const [typingUsers, setTypingUsers] = useState({}); // roomId -> Set of userNames
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [contacts, setContacts] = useState(initialContacts);
  const [loadingRooms, setLoadingRooms] = useState(
    Boolean(user?.id && token && initialRooms.length === 0)
  );
  const [loadingContacts, setLoadingContacts] = useState(
    Boolean(user?.id && token && initialContacts.length === 0)
  );
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const resetChatState = () => {
    setRooms(initialRooms);
    setActiveRoomId(initialActiveRoomId || (initialRooms[0]?.id || null));
    setMessages(initialMessages);
    setTypingUsers({});
    setRightPanelOpen(false);
    setContacts(initialContacts);
    setReplyingTo(null);
    setLoadingRooms(false);
    setLoadingContacts(false);
  };

  useEffect(() => {
    if (!user?.id || !token) {
      resetChatState();
    }
  }, [user?.id, token]);

  const activeRoom = (activeRoomId && rooms.find((r) => r.id === activeRoomId)) || null;

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!activeRoomId) {
      setLoadingMessages(false);
      return;
    }
    setLoadingMessages(true);
    const timer = window.setTimeout(() => setLoadingMessages(false), 300);
    return () => window.clearTimeout(timer);
  }, [activeRoomId]);

  useEffect(() => {
    const loadPersistedChat = async () => {
      if (!user?.id || !token) {
        setLoadingRooms(false);
        return;
      }

      setLoadingRooms(true);
      try {
        const roomData = await roomsApi.mine(token);
        const nextRooms = (roomData?.rooms || []).map((room) => {
          let name = room.name;
          let avatar = undefined;
          let lastSeenAt = null;
          if (room.type === "dm") {
            const otherMember = (room.members || []).find((m) => m.id !== user.id);
            if (otherMember) {
              name = otherMember.name;
              avatar = otherMember.avatarUrl;
              lastSeenAt = otherMember.lastSeenAt || null;
            }
          }
          return {
            id: room.id,
            name,
            type: room.type || "channel",
            unread: room.unread || 0,
            lastMessage: room.lastMessage || null,
            icon: room.type === "channel" ? "#" : undefined,
            avatar,
            members: (room.members || []).map((m) => m.id),
            isOnline: (room.members || []).some((m) => m.id !== user.id && m.isOnline),
            lastSeenAt,
            lastSeen:
              room.type === "dm"
                ? (room.members || []).some((m) => m.id !== user.id && m.isOnline)
                  ? "Online"
                  : lastSeenAt
                    ? formatLastSeenAt(lastSeenAt)
                    : "OFFLINE"
                : undefined,
          };
        });

        if (nextRooms.length > 0) {
          const initialRoomId = nextRooms[0].id;
          const updatedRooms = nextRooms.map((r) =>
            r.id === initialRoomId ? { ...r, unread: 0 } : r,
          );
          setRooms(updatedRooms);
          setActiveRoomId((prev) =>
            prev && nextRooms.some((r) => r.id === prev) ? prev : initialRoomId
          );

          if (token && initialRoomId && !initialRoomId.startsWith("room_")) {
            roomsApi.markRead(token, initialRoomId).catch(() => null);
          }
        } else if (initialRooms.length === 0) {
          setRooms([]);
          setActiveRoomId(null);
        }
      } catch (error) {
        console.error("Failed to load persisted rooms:", error);
        if (initialRooms.length === 0) {
          setRooms([]);
          setActiveRoomId(null);
        }
      } finally {
        setLoadingRooms(false);
      }
    };

    const loadUsers = async () => {
      if (!user?.id || !token) {
        setLoadingContacts(false);
        return;
      }

      setLoadingContacts(true);
      try {
        const data = await usersApi.list(token);
        const dbContacts = (data?.users || [])
          .filter((u) => u.id !== user.id)
          .map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            avatarUrl: u.avatarUrl,
            isOnline: Boolean(u.isOnline),
            lastSeenAt: u.lastSeenAt || null,
            lastSeen: u.isOnline
              ? "Online"
              : u.lastSeenAt
                ? formatLastSeenAt(u.lastSeenAt)
                : "OFFLINE",
          }));

        if (dbContacts.length > 0 || initialContacts.length === 0) {
          setContacts(dbContacts);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
        if (initialContacts.length === 0) {
          setContacts([]);
        }
      } finally {
        setLoadingContacts(false);
      }
    };

    loadPersistedChat();
    loadUsers();
  }, [user?.id, token]);


  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeRoomId || !token) return;
      if (activeRoomId.startsWith("room_")) return;

      setLoadingMessages(true);
      try {
        const data = await roomsApi.messages.list(token, activeRoomId);
        const formatted = data.messages.map((msg) => {
          let parsedReplyTo = null;
          if (msg.replyTo) {
            try {
              parsedReplyTo =
                typeof msg.replyTo === "string"
                  ? JSON.parse(msg.replyTo)
                  : msg.replyTo;
            } catch {
              parsedReplyTo = msg.replyTo;
            }
          }
          let parsedForwardedFrom = null;
          if (msg.forwardedFrom) {
            try {
              parsedForwardedFrom =
                typeof msg.forwardedFrom === "string"
                  ? JSON.parse(msg.forwardedFrom)
                  : msg.forwardedFrom;
            } catch {
              parsedForwardedFrom = msg.forwardedFrom;
            }
          }

          let parsedMeta =
            parsedReplyTo && typeof parsedReplyTo === "object" && (parsedReplyTo.isSystem || parsedReplyTo.type === "system")
              ? parsedReplyTo
              : null;

          if (!parsedMeta && typeof msg.content === "string") {
            try {
              const parsed = JSON.parse(msg.content);
              if (parsed && typeof parsed === "object" && (parsed.isSystem || parsed.type === "system")) {
                parsedMeta = parsed;
              }
            } catch {
              // Not JSON
            }
          }

          if (parsedMeta) {
            const pinnerId = parsedMeta.pinnerId || msg.senderId;
            const isPinnerMe = Boolean(user?.id && pinnerId === user.id);
            const pinnerDisplayName = isPinnerMe
              ? "You"
              : parsedMeta.pinnerName || msg.sender?.name || "Someone";
            const snippet = parsedMeta.snippet || "";
            const cleanSnippet = snippet ? ` "${snippet}"` : "";
            const action = parsedMeta.isPinned === false ? "unpinned" : "pinned";
            const contentText = `${pinnerDisplayName} ${action} the message${cleanSnippet}`;

            return {
              id: msg.id,
              roomId: msg.roomId,
              senderId: pinnerId,
              senderName: msg.sender?.name || pinnerDisplayName,
              senderAvatar: msg.sender?.avatarUrl || null,
              content: contentText,
              isSystem: true,
              type: "system",
              pinnedMessageId: parsedMeta.pinnedMessageId,
              pinnerId,
              pinnerName: parsedMeta.pinnerName || msg.sender?.name,
              snippet,
              isPinned: parsedMeta.isPinned ?? true,
              createdAt: msg.createdAt,
            };
          }

          return {
            id: msg.id,
            roomId: msg.roomId,
            senderId: msg.senderId,
            senderName: msg.sender?.name || "Unknown",
            senderAvatar:
              msg.sender?.avatarUrl ||
              "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&auto=format&fit=crop&q=80",
            content: msg.content,
            attachmentUrl: msg.attachmentUrl,
            replyTo: parsedReplyTo,
            forwardedFrom: parsedForwardedFrom,
            isForwarded: Boolean(msg.isForwarded || parsedForwardedFrom),
            isEdited: msg.isEdited || false,
            isPinned: msg.isPinned || false,
            isDeleted: msg.isDeleted || false,
            createdAt: msg.createdAt,
            readReceipts: msg.readReceipts?.map((r) => r.userId) || [],
          };
        });

        // Ensure all currently pinned messages have a visible system statement sentence
        const pinnedList = formatted.filter((m) => m.isPinned && !m.isDeleted && !m.isSystem && m.type !== "system");
        const resultMessages = [...formatted];

        pinnedList.forEach((pinnedMsg) => {
          const hasNotice = resultMessages.some(
            (m) =>
              (m.isSystem || m.type === "system") &&
              m.pinnedMessageId === pinnedMsg.id &&
              m.isPinned !== false,
          );
          if (!hasNotice) {
            const isPinnerMe = Boolean(user?.id && pinnedMsg.senderId === user.id);
            const pinnerDisplayName = isPinnerMe
              ? "You"
              : pinnedMsg.senderName || "Someone";
            let rawSnippet =
              pinnedMsg.content ||
              (pinnedMsg.attachmentUrl ? "📷 Attachment" : "");
            const shortSnippet = rawSnippet
              ? rawSnippet.length > 25
                ? `${rawSnippet.slice(0, 25)}...`
                : rawSnippet
              : "";
            const cleanSnippet = shortSnippet ? ` "${shortSnippet}"` : "";

            const syntheticNotice = {
              id: `sys_pin_${pinnedMsg.id}_pin`,
              roomId: activeRoomId,
              isSystem: true,
              type: "system",
              pinnedMessageId: pinnedMsg.id,
              pinnerId: pinnedMsg.senderId,
              pinnerName: pinnedMsg.senderName,
              snippet: shortSnippet,
              isPinned: true,
              content: `${pinnerDisplayName} pinned the message${cleanSnippet}`,
              createdAt: pinnedMsg.createdAt || new Date().toISOString(),
            };
            resultMessages.push(syntheticNotice);
          }
        });

        setMessages((prev) => ({
          ...prev,
          [activeRoomId]: resultMessages,
        }));
      } catch (err) {
        console.error("Failed to fetch messages for room:", activeRoomId, err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [activeRoomId, token, user?.id, user?.name]);

  // Join all user rooms on Socket.io connection to receive real-time notifications across all channels & DMs
  useEffect(() => {
    if (!socket || !connected) return;

    if (rooms && rooms.length) {
      rooms.forEach((r) => {
        socket.emit("room:join", { roomId: r.id });
      });
    }

    const handleNewMessage = (msg) => {
      const senderName = msg.senderName || msg.sender?.name || "Netrunner";
      const senderAvatar =
        msg.senderAvatar ||
        msg.sender?.avatarUrl ||
        "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&auto=format&fit=crop&q=80";

      let parsedReplyTo = null;
      if (msg.replyTo) {
        try {
          parsedReplyTo =
            typeof msg.replyTo === "string"
              ? JSON.parse(msg.replyTo)
              : msg.replyTo;
        } catch {
          parsedReplyTo = msg.replyTo;
        }
      }

      let parsedForwardedFrom = null;
      if (msg.forwardedFrom) {
        try {
          parsedForwardedFrom =
            typeof msg.forwardedFrom === "string"
              ? JSON.parse(msg.forwardedFrom)
              : msg.forwardedFrom;
        } catch {
          parsedForwardedFrom = msg.forwardedFrom;
        }
      }

      const formattedMsg = {
        ...msg,
        replyTo: parsedReplyTo,
        forwardedFrom: parsedForwardedFrom,
        isForwarded: Boolean(msg.isForwarded || parsedForwardedFrom),
        senderName,
        senderAvatar,
      };

      setMessages((prev) => {
        const roomMsgs = prev[msg.roomId] || [];

        const optimisticIndex = roomMsgs.findIndex(
          (m) =>
            m.clientMessageId &&
            msg.clientMessageId &&
            m.clientMessageId === msg.clientMessageId,
        );

        if (optimisticIndex >= 0) {
          const updatedRoomMsgs = [...roomMsgs];
          updatedRoomMsgs[optimisticIndex] = {
            ...updatedRoomMsgs[optimisticIndex],
            ...formattedMsg,
            id: msg.id || updatedRoomMsgs[optimisticIndex].id,
            clientMessageId:
              msg.clientMessageId ||
              updatedRoomMsgs[optimisticIndex].clientMessageId,
          };
          return {
            ...prev,
            [msg.roomId]: updatedRoomMsgs,
          };
        }

        if (roomMsgs.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          [msg.roomId]: [...roomMsgs, formattedMsg],
        };
      });

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id === msg.roomId) {
            const isCurrentActive = room.id === activeRoomId;
            const isOtherUser = msg.senderId !== user?.id;
            return {
              ...room,
              unread:
                isOtherUser && !isCurrentActive
                  ? (room.unread || 0) + 1
                  : room.unread,
              lastMessage: {
                content: msg.content,
                attachmentUrl: msg.attachmentUrl,
                senderId: msg.senderId,
                senderName: formattedMsg.senderName,
                createdAt: msg.createdAt,
                readReceipts: msg.readReceipts || [msg.senderId],
              },
            };
          }
          return room;
        }),
      );

      // If user is actively viewing this room and receives a message from another netrunner, mark as read in real-time instantly
      if (
        msg.senderId !== (user?.id || "usr_netrunner_01") &&
        msg.roomId === activeRoomId
      ) {
        if (socket && connected) {
          socket.emit("message:read", {
            roomId: msg.roomId,
            messageId: msg.id,
            userId: user?.id || "usr_netrunner_01",
          });
        }
        if (token && msg.roomId && !msg.roomId.startsWith("room_")) {
          roomsApi.markRead(token, msg.roomId).catch(() => null);
        }
      }
    };

    const handleTypingUpdate = ({ roomId, userId, isTyping }) => {
      const contact = contacts.find((c) => c.id === userId) || { name: userId };
      setTypingUsers((prev) => {
        const currentSet = new Set(prev[roomId] || []);
        if (isTyping) {
          currentSet.add(contact.name);
        } else {
          currentSet.delete(contact.name);
        }
        return { ...prev, [roomId]: Array.from(currentSet) };
      });
    };

    const handlePresenceUpdate = ({ userId, isOnline, lastSeenAt }) => {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === userId
            ? {
                ...c,
                isOnline,
                lastSeenAt: isOnline
                  ? null
                  : lastSeenAt || c.lastSeenAt || null,
                lastSeen: isOnline
                  ? "Online"
                  : lastSeenAt
                    ? formatLastSeenAt(lastSeenAt)
                    : c.lastSeen || "OFFLINE",
              }
            : c,
        ),
      );

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.type !== "dm" || !room.members?.includes(userId)) {
            return room;
          }

          return {
            ...room,
            isOnline,
            lastSeenAt: isOnline ? null : lastSeenAt || room.lastSeenAt || null,
            lastSeen: isOnline
              ? "Online"
              : lastSeenAt
                ? formatLastSeenAt(lastSeenAt)
                : room.lastSeen || "OFFLINE",
          };
        }),
      );
    };

    // Fired when another user edits their name, avatar, or manually-set status
    // (online/away/busy/offline) from their profile modal. Updates their entry
    // in our contacts list plus any DM room whose denormalized name/avatar
    // came from them. Ignores echoes of our own update.
    const handleProfileUpdate = ({ userId, name, avatarUrl, status }) => {
      if (!userId || userId === user?.id) return;

      setContacts((prev) =>
        prev.map((c) =>
          c.id === userId
            ? {
                ...c,
                ...(name ? { name } : {}),
                ...(avatarUrl ? { avatarUrl } : {}),
                ...(status ? { status, isOnline: status !== "offline" } : {}),
              }
            : c,
        ),
      );

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.type !== "dm" || !room.members?.includes(userId))
            return room;
          return {
            ...room,
            ...(name ? { name } : {}),
            ...(avatarUrl ? { avatar: avatarUrl } : {}),
            ...(status ? { isOnline: status !== "offline" } : {}),
          };
        }),
      );
    };

    const handleMessageRead = ({ messageId, messageIds, userId, roomId }) => {
      const targetIds = messageIds || (messageId ? [messageId] : null);

      setMessages((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((rId) => {
          if (!roomId || rId === roomId) {
            updated[rId] = (updated[rId] || []).map((m) => {
              if (
                (!targetIds || targetIds.includes(m.id)) &&
                userId &&
                userId !== m.senderId &&
                !m.readReceipts?.includes(userId)
              ) {
                return {
                  ...m,
                  readReceipts: [...(m.readReceipts || []), userId],
                };
              }
              return m;
            });
          }
        });
        return updated;
      });

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (!roomId || room.id === roomId) {
            if (
              room.lastMessage &&
              !room.lastMessage.readReceipts?.includes(userId)
            ) {
              return {
                ...room,
                lastMessage: {
                  ...room.lastMessage,
                  readReceipts: [
                    ...(room.lastMessage.readReceipts || []),
                    userId,
                  ],
                },
              };
            }
          }
          return room;
        }),
      );
    };

    const handleNewRoom = (room) => {
      socket.emit("room:join", { roomId: room.id });

      setRooms((prev) => {
        let name = room.name;
        let avatar = undefined;
        if (room.type === "dm") {
          const otherMember = room.members.find(
            (m) => (typeof m === "string" ? m : m.id) !== user?.id,
          );
          if (otherMember) {
            name =
              typeof otherMember === "string" ? otherMember : otherMember.name;
            avatar =
              typeof otherMember === "string"
                ? undefined
                : otherMember.avatarUrl;
          }
        }

        const newRoomFormatted = {
          id: room.id,
          name,
          type: room.type || "channel",
          unread: 0,
          icon: room.type === "channel" ? "#" : undefined,
          avatar,
          members: room.members.map((m) => (typeof m === "string" ? m : m.id)),
        };

        return mergeAndDedupeRooms(prev, [newRoomFormatted]);
      });

      showToast(`Added to new room: #${room.name}`, "info");
    };

    const handleMessageDeleted = ({ messageId, roomId }) => {
      // Soft-delete: mark the message as deleted in local state for all users
      setMessages((prev) => {
        const updated = { ...prev };
        const key =
          roomId ||
          Object.keys(updated).find((k) =>
            (updated[k] || []).some((m) => m.id === messageId),
          );
        if (key && updated[key]) {
          updated[key] = updated[key].map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: "", attachmentUrl: null }
              : m,
          );
        }
        return updated;
      });

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id === roomId && room.lastMessage) {
            return {
              ...room,
              lastMessage: {
                ...room.lastMessage,
                content: "🚫 This message was deleted",
                attachmentUrl: null,
                isDeleted: true,
              },
            };
          }
          return room;
        }),
      );
    };

    const handleMessageEdited = ({ messageId, roomId, content, isEdited }) => {
      setMessages((prev) => {
        const updated = { ...prev };
        const key =
          roomId ||
          Object.keys(updated).find((k) =>
            (updated[k] || []).some((m) => m.id === messageId),
          );
        if (key && updated[key]) {
          updated[key] = updated[key].map((m) => {
            let updatedMsg = m;
            if (m.id === messageId) {
              updatedMsg = {
                ...updatedMsg,
                content,
                isEdited: isEdited !== undefined ? isEdited : true,
              };
            }
            if (m.replyTo && m.replyTo.id === messageId) {
              updatedMsg = {
                ...updatedMsg,
                replyTo: {
                  ...m.replyTo,
                  content,
                },
              };
            }
            return updatedMsg;
          });
        }
        return updated;
      });

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.id === roomId && room.lastMessage) {
            return {
              ...room,
              lastMessage: {
                ...room.lastMessage,
                content,
              },
            };
          }
          return room;
        }),
      );
    };

    const handleMessagePinned = ({
      messageId,
      roomId,
      isPinned,
      pinnerId,
      pinnerName,
      snippet,
      systemMessageId,
    }) => {
      const isPinnerMe = Boolean(
        (pinnerId && user?.id && pinnerId === user.id) ||
        (pinnerName && user?.name && pinnerName === user.name) ||
        pinnerName === "YOU",
      );
      const pinnerDisplayName = isPinnerMe ? "You" : pinnerName || "Someone";
      const cleanSnippet = snippet ? ` "${snippet}"` : "";
      const noticeText = isPinned
        ? `${pinnerDisplayName} pinned the message${cleanSnippet}`
        : `${pinnerDisplayName} unpinned the message${cleanSnippet}`;

      const noticeId =
        systemMessageId || `sys_pin_${messageId}_${isPinned ? "pin" : "unpin"}`;

      setMessages((prev) => {
        const updated = { ...prev };
        const key =
          roomId ||
          Object.keys(updated).find((k) =>
            (updated[k] || []).some((m) => m.id === messageId),
          );
        if (key && updated[key]) {
          const updatedRoomMsgs = updated[key].map((m) =>
            m.id === messageId ? { ...m, isPinned } : m,
          );

          const systemNotice = {
            id: noticeId,
            roomId: key,
            isSystem: true,
            type: "system",
            pinnedMessageId: messageId,
            pinnerId: pinnerId || (isPinnerMe ? user?.id : "system"),
            pinnerName: pinnerName || (isPinnerMe ? user?.name || "YOU" : "Someone"),
            snippet: snippet || "",
            isPinned,
            content: noticeText,
            createdAt: new Date().toISOString(),
          };

          // Check if system notice already exists to guarantee exactly one sentence
          const existingIndex = updatedRoomMsgs.findIndex(
            (m) =>
              m.id === noticeId ||
              ((m.isSystem || m.type === "system") &&
                m.pinnedMessageId === messageId &&
                m.isPinned === isPinned),
          );

          let finalRoomMsgs;
          if (existingIndex >= 0) {
            finalRoomMsgs = [...updatedRoomMsgs];
            finalRoomMsgs[existingIndex] = {
              ...finalRoomMsgs[existingIndex],
              ...systemNotice,
            };
          } else {
            finalRoomMsgs = [...updatedRoomMsgs, systemNotice];
          }

          updated[key] = finalRoomMsgs;
        }
        return updated;
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("profile:update", handleProfileUpdate);
    socket.on("message:read", handleMessageRead);
    socket.on("room:new", handleNewRoom);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("message:edited", handleMessageEdited);
    socket.on("message:pinned", handleMessagePinned);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("profile:update", handleProfileUpdate);
      socket.off("message:read", handleMessageRead);
      socket.off("room:new", handleNewRoom);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("message:edited", handleMessageEdited);
      socket.off("message:pinned", handleMessagePinned);
    };
  }, [socket, connected, rooms, contacts, user?.id, activeRoomId, token]);

  const markRoomAsRead = (roomId) => {
    const targetRoomId = roomId || activeRoomId;
    if (!targetRoomId) return;

    const currentUserId = user?.id || "usr_netrunner_01";

    setMessages((prev) => {
      const roomMsgs = prev[targetRoomId];
      if (!roomMsgs || roomMsgs.length === 0) return prev;

      let hasUnread = false;
      const updatedRoomMsgs = roomMsgs.map((m) => {
        if (
          m.senderId !== currentUserId &&
          !m.readReceipts?.includes(currentUserId)
        ) {
          hasUnread = true;
          return {
            ...m,
            readReceipts: [...(m.readReceipts || []), currentUserId],
          };
        }
        return m;
      });

      if (!hasUnread) return prev;
      return { ...prev, [targetRoomId]: updatedRoomMsgs };
    });

    if (socket && connected) {
      socket.emit("message:read", {
        roomId: targetRoomId,
        userId: currentUserId,
      });
    }

    if (token && targetRoomId && !targetRoomId.startsWith("room_")) {
      roomsApi
        .markRead(token, targetRoomId)
        .catch((err) => console.error("Failed to mark room as read:", err));
    }
  };

  const selectRoom = (roomId) => {
    setActiveRoomId(roomId);
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, unread: 0 } : r)),
    );
    markRoomAsRead(roomId);
  };

  const sendMessage = async ({ content, attachmentUrl }) => {
    if (!content && !attachmentUrl) return;

    const clientMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const currentReply = replyingTo
      ? {
          id: replyingTo.id,
          senderId: replyingTo.senderId,
          senderName:
            replyingTo.senderName ||
            (replyingTo.senderId === user?.id
              ? user?.name || "YOU"
              : "Netrunner"),
          content:
            replyingTo.content ||
            (replyingTo.attachmentUrl ? "📷 Attachment" : ""),
          attachmentUrl: replyingTo.attachmentUrl || null,
        }
      : null;

    const newMsg = {
      id: clientMessageId,
      clientMessageId,
      roomId: activeRoomId,
      senderId: user?.id || "usr_netrunner_01",
      senderName: user?.name || "V_Netrunner",
      senderAvatar:
        user?.avatarUrl ||
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
      content: content || "",
      attachmentUrl: attachmentUrl || null,
      replyTo: currentReply,
      createdAt: new Date().toISOString(),
      readReceipts: [user?.id || "usr_netrunner_01"],
    };

    setMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMsg],
    }));

    setReplyingTo(null);

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === activeRoomId) {
          return {
            ...room,
            lastMessage: {
              content: content || "",
              attachmentUrl: attachmentUrl || null,
              senderName: user?.name || "YOU",
              createdAt: newMsg.createdAt,
            },
          };
        }
        return room;
      }),
    );

    if (socket && connected) {
      socket.emit("message:send", {
        roomId: activeRoomId,
        content: content || "",
        attachmentUrl: attachmentUrl || null,
        replyTo: currentReply,
        clientMessageId,
      });
    } else if (token && activeRoomId && !activeRoomId.startsWith("room_")) {
      try {
        await roomsApi.messages.send(token, activeRoomId, {
          content: content || "",
          attachmentUrl: attachmentUrl || null,
          replyTo: currentReply,
        });
      } catch (error) {
        console.error("Message persistence failed:", error);
      }
    }
  };

  const editMessage = async (messageId, newContent) => {
    if (!messageId || !newContent.trim()) return;
    const trimmed = newContent.trim();

    setMessages((prev) => {
      const roomMsgs = prev[activeRoomId] || [];
      const updated = roomMsgs.map((m) => {
        let updatedMsg = m;
        if (m.id === messageId) {
          updatedMsg = { ...updatedMsg, content: trimmed, isEdited: true };
        }
        if (m.replyTo && m.replyTo.id === messageId) {
          updatedMsg = {
            ...updatedMsg,
            replyTo: {
              ...m.replyTo,
              content: trimmed,
            },
          };
        }
        return updatedMsg;
      });
      return { ...prev, [activeRoomId]: updated };
    });

    if (socket && connected) {
      socket.emit("message:edit", {
        messageId,
        roomId: activeRoomId,
        content: trimmed,
      });
    }

    if (
      token &&
      !activeRoomId.startsWith("room_") &&
      !messageId.startsWith("msg_")
    ) {
      try {
        await messagesApi.edit(token, messageId, { content: trimmed });
      } catch (err) {
        console.error("Failed to persist edit on server:", err);
      }
    }

    showToast("Message edited successfully", "success");
  };

  const pinMessage = async (messageId, isPinned = true) => {
    if (!messageId) return;

    // Find the message snippet to display in toast
    let snippet = "";
    const roomMsgs = messages[activeRoomId] || [];
    const targetMsg = roomMsgs.find((m) => m.id === messageId);
    if (targetMsg) {
      snippet =
        targetMsg.content || (targetMsg.attachmentUrl ? "📷 Attachment" : "");
    } else {
      for (const rId of Object.keys(messages)) {
        const found = (messages[rId] || []).find((m) => m.id === messageId);
        if (found) {
          snippet =
            found.content || (found.attachmentUrl ? "📷 Attachment" : "");
          break;
        }
      }
    }

    const shortSnippet = snippet
      ? snippet.length > 25
        ? `${snippet.slice(0, 25)}...`
        : snippet
      : "";

    const noticeId = `sys_pin_${messageId}_${isPinned ? "pin" : "unpin"}`;
    const cleanSnippet = shortSnippet ? ` "${shortSnippet}"` : "";
    const noticeText = isPinned
      ? `You pinned the message${cleanSnippet}`
      : `You unpinned the message${cleanSnippet}`;

    const systemNotice = {
      id: noticeId,
      roomId: activeRoomId,
      isSystem: true,
      type: "system",
      pinnedMessageId: messageId,
      pinnerId: user?.id || "system",
      pinnerName: user?.name || "YOU",
      snippet: shortSnippet,
      isPinned,
      content: noticeText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => {
      const currentRoomMsgs = prev[activeRoomId] || [];
      const updated = currentRoomMsgs.map((m) =>
        m.id === messageId ? { ...m, isPinned } : m,
      );

      const existingIndex = updated.findIndex(
        (m) =>
          m.id === noticeId ||
          ((m.isSystem || m.type === "system") &&
            m.pinnedMessageId === messageId &&
            m.isPinned === isPinned),
      );

      let finalMsgs;
      if (existingIndex >= 0) {
        finalMsgs = [...updated];
        finalMsgs[existingIndex] = {
          ...finalMsgs[existingIndex],
          ...systemNotice,
        };
      } else {
        finalMsgs = [...updated, systemNotice];
      }

      return { ...prev, [activeRoomId]: finalMsgs };
    });

    if (socket && connected) {
      socket.emit("message:pin", {
        messageId,
        roomId: activeRoomId,
        isPinned,
        pinnerName: user?.name || "YOU",
        snippet: shortSnippet,
        systemMessageId: noticeId,
      });
    }

    if (
      token &&
      !activeRoomId.startsWith("room_") &&
      !messageId.startsWith("msg_")
    ) {
      try {
        await messagesApi.pin(token, messageId, { isPinned });
      } catch (err) {
        console.error("Failed to persist pin on server:", err);
      }
    }
  };

  const forwardMessage = async (messageToForward, targetRoomId) => {
    if (!messageToForward || !targetRoomId) return;

    const targetRoom = rooms.find((r) => r.id === targetRoomId);
    const clientMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const originalSenderName =
      messageToForward.forwardedFrom?.senderName ||
      messageToForward.senderName ||
      messageToForward.sender?.name ||
      (messageToForward.senderId === user?.id
        ? user?.name || "YOU"
        : "Netrunner");

    const originalSenderAvatar =
      messageToForward.forwardedFrom?.senderAvatar ||
      messageToForward.senderAvatar ||
      messageToForward.sender?.avatarUrl ||
      (messageToForward.senderId === user?.id
        ? user?.avatarUrl
        : "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&auto=format&fit=crop&q=80");

    const forwardedFrom = {
      senderId:
        messageToForward.forwardedFrom?.senderId || messageToForward.senderId,
      senderName: originalSenderName,
      senderAvatar: originalSenderAvatar,
    };

    const newMsg = {
      id: clientMessageId,
      clientMessageId,
      roomId: targetRoomId,
      senderId: user?.id || "usr_netrunner_01",
      senderName: user?.name || "V_Netrunner",
      senderAvatar:
        user?.avatarUrl ||
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80",
      content: messageToForward.content || "",
      attachmentUrl: messageToForward.attachmentUrl || null,
      isForwarded: true,
      forwardedFrom,
      createdAt: new Date().toISOString(),
      readReceipts: [user?.id || "usr_netrunner_01"],
    };

    setMessages((prev) => ({
      ...prev,
      [targetRoomId]: [...(prev[targetRoomId] || []), newMsg],
    }));

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === targetRoomId) {
          return {
            ...room,
            lastMessage: {
              content: newMsg.content,
              attachmentUrl: newMsg.attachmentUrl,
              senderName: user?.name || "YOU",
              createdAt: newMsg.createdAt,
            },
          };
        }
        return room;
      }),
    );

    if (socket && connected) {
      socket.emit("message:send", {
        roomId: targetRoomId,
        content: newMsg.content,
        attachmentUrl: newMsg.attachmentUrl,
        forwardedFrom,
        isForwarded: true,
        clientMessageId,
      });
    } else if (token && !targetRoomId.startsWith("room_")) {
      try {
        await roomsApi.messages.send(token, targetRoomId, {
          content: newMsg.content,
          attachmentUrl: newMsg.attachmentUrl,
          forwardedFrom,
          isForwarded: true,
        });
      } catch (error) {
        console.error("Forward persistence failed:", error);
      }
    }

    showToast(`Message forwarded to #${targetRoom?.name || "chat"}`, "success");
  };

  const deleteMessage = async (messageId) => {
    if (!messageId) return;

    // Optimistically soft-delete in local state (mark isDeleted, clear content)
    setMessages((prev) => {
      const roomMsgs = prev[activeRoomId] || [];
      const updated = roomMsgs.map((m) =>
        m.id === messageId
          ? { ...m, isDeleted: true, content: "", attachmentUrl: null }
          : m,
      );
      return { ...prev, [activeRoomId]: updated };
    });

    if (socket && connected) {
      socket.emit("message:delete", { messageId, roomId: activeRoomId });
    }

    // Persist soft-delete to DB for real rooms (skip for mock/demo IDs)
    if (
      token &&
      !activeRoomId.startsWith("room_") &&
      !messageId.startsWith("msg_")
    ) {
      try {
        await messagesApi.delete(token, messageId);
      } catch (err) {
        // Roll back the optimistic soft-delete on failure
        console.error("Failed to delete message on server, rolling back.", err);
        showToast(
          err.data?.error || err.message || "Failed to delete message",
          "error",
        );

        // Re-fetch messages to restore correct state
        try {
          const refetchData = await roomsApi.messages.list(token, activeRoomId);
          const formatted = refetchData.messages.map((msg) => ({
            id: msg.id,
            roomId: msg.roomId,
            senderId: msg.senderId,
            senderName: msg.sender?.name || "Unknown",
            senderAvatar: msg.sender?.avatarUrl || "",
            content: msg.content,
            attachmentUrl: msg.attachmentUrl,
            isDeleted: msg.isDeleted || false,
            createdAt: msg.createdAt,
            readReceipts: msg.readReceipts?.map((r) => r.userId) || [],
          }));
          setMessages((prev) => ({ ...prev, [activeRoomId]: formatted }));
        } catch (refetchErr) {
          console.error(
            "Failed to refetch messages after rollback:",
            refetchErr,
          );
        }
        return;
      }
    }

    showToast("Message deleted", "info");
  };

  // Saves the current user's own profile edits (name, avatarUrl, status) and
  // lets everyone else's client know, so it shows up live in their contacts
  // list and any open DM with this user — not just after they refresh.
  const updateOwnProfile = async (updatedFields) => {
    const savedUser = await updateProfile(updatedFields);
    const effectiveUser = savedUser || { ...user, ...updatedFields };

    if (socket && connected) {
      socket.emit("profile:update", {
        userId: effectiveUser.id,
        name: effectiveUser.name,
        avatarUrl: effectiveUser.avatarUrl,
        status: effectiveUser.status,
      });
    }

    return effectiveUser;
  };

  const emitTyping = (isTyping) => {
    if (socket && connected && activeRoomId) {
      socket.emit(isTyping ? "typing:start" : "typing:stop", {
        roomId: activeRoomId,
      });
    }
  };

  const uploadFileToS3 = async (file) => {
    const { uploadUrl, publicUrl } = await uploadApi.presign(token, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    await uploadApi.putFile(uploadUrl, file);

    return publicUrl;
  };

  const createGroup = async (name, selectedMemberIds) => {
    const newRoomName = name.toLowerCase().replace(/\s+/g, "-");
    if (token) {
      try {
        const data = await roomsApi.create(token, {
          name: newRoomName,
          type: "channel",
          userIds: selectedMemberIds,
        });
        const room = data.room;
        const createdRoom = {
          id: room.id,
          name: room.name,
          type: room.type || "channel",
          unread: 0,
          icon: room.type === "channel" ? "#" : undefined,
          members: [user.id, ...selectedMemberIds],
        };
        setRooms((prev) => [...prev, createdRoom]);
        setActiveRoomId(createdRoom.id);
        showToast(
          `Channel #${createdRoom.name} initialized successfully`,
          "success",
        );
        return;
      } catch (error) {
        console.error("Failed to create group on server:", error);
      }
    }

    const newRoom = {
      id: `room_${Date.now()}`,
      name: newRoomName,
      type: "channel",
      unread: 0,
      icon: "#",
      members: [user?.id || "usr_netrunner_01", ...selectedMemberIds],
    };
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newRoom.id);
    showToast(
      `Channel #${newRoom.name} initialized successfully (mock mode)`,
      "success",
    );
  };

  const startDM = async (contact) => {
    const existing = rooms.find(
      (r) =>
        r.type === "dm" &&
        (r.members?.includes(contact.id) ||
          r.name.toLowerCase() === contact.name.toLowerCase()),
    );
    if (existing) {
      setActiveRoomId(existing.id);
      showToast(`Direct message node with ${contact.name} open`, "info");
      return;
    }

    if (token) {
      try {
        const data = await roomsApi.create(token, {
          name: `${user.name}-${contact.name}`,
          type: "dm",
          userIds: [contact.id],
        });
        const room = data.room;
        const createdRoom = {
          id: room.id,
          name: contact.name,
          type: room.type || "dm",
          unread: 0,
          avatar: contact.avatarUrl,
          isOnline: contact.isOnline,
          members: [user.id, contact.id],
        };
        setRooms((prev) => mergeAndDedupeRooms(prev, [createdRoom]));
        setActiveRoomId(createdRoom.id);
        showToast(
          `Direct message link established with ${contact.name}`,
          "success",
        );
        return;
      } catch (error) {
        console.error("Failed to start DM on server:", error);
      }
    }

    const newDM = {
      id: `room_dm_${Date.now()}`,
      name: contact.name,
      type: "dm",
      unread: 0,
      avatar: contact.avatarUrl,
      isOnline: contact.isOnline,
      members: [user?.id || "usr_netrunner_01", contact.id],
    };
    setRooms((prev) => mergeAndDedupeRooms(prev, [newDM]));
    setActiveRoomId(newDM.id);
    showToast(
      `Direct message link established with ${contact.name} (mock mode)`,
      "success",
    );
  };

  return (
    <ChatContext.Provider
      value={{
        rooms,
        activeRoom,
        activeRoomId,
        messages: messages[activeRoomId] || [],
        typingUsers: typingUsers[activeRoomId] || [],
        rightPanelOpen,
        setRightPanelOpen,
        contacts,
        toast,
        showToast,
        closeToast,
        loadingMessages,
        loadingRooms,
        loadingContacts,
        replyingTo,
        setReplyingTo,
        selectRoom,
        markRoomAsRead,
        sendMessage,
        editMessage,
        pinMessage,
        forwardMessage,
        deleteMessage,
        emitTyping,
        updateOwnProfile,
        uploadFileToS3,
        createGroup,
        startDM,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
