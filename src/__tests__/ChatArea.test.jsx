import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatArea } from '../components/ChatArea';
import { ThemeProvider } from '@mui/material';
import { cyberpunkTheme } from '../theme/cyberpunkTheme';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/ChatContext', () => ({
  useChat: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ChatArea Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeletons while messages are loading', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1'] },
      messages: [],
      typingUsers: [],
      loadingMessages: true,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByLabelText('Message Stream')).toBeDefined();
    expect(document.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0);
  });

  it('exposes accessible labels for the room header controls', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1'] },
      messages: [],
      typingUsers: [],
      loadingMessages: false,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByLabelText(/toggle room info panel/i)).toBeDefined();
  });

  it('renders double green tick for read messages in conversation section', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1', 'u2'] },
      messages: [
        {
          id: 'msg_1',
          roomId: 'room_1',
          senderId: 'u1',
          senderName: 'TestUser',
          content: 'Hello World',
          createdAt: new Date().toISOString(),
          readReceipts: ['u1', 'u2'],
        },
      ],
      typingUsers: [],
      contacts: [{ id: 'u2', name: 'OtherUser', isOnline: true }],
      loadingMessages: false,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('double-green-tick')).toBeDefined();
    expect(screen.getByLabelText(/Read double green tick/i)).toBeDefined();
  });

  it('renders quoted reply banner showing previous conversation when replying to user', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1', 'u2'] },
      messages: [
        {
          id: 'msg_2',
          roomId: 'room_1',
          senderId: 'u2',
          senderName: 'Alt_Cunningham',
          content: 'I agree with your strategy!',
          replyTo: {
            id: 'msg_1',
            senderId: 'u1',
            senderName: 'TestUser',
            content: 'Should we breach the subnet now?',
          },
          createdAt: new Date().toISOString(),
          readReceipts: ['u2'],
        },
      ],
      typingUsers: [],
      contacts: [{ id: 'u2', name: 'Alt_Cunningham', isOnline: true }],
      loadingMessages: false,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1', name: 'TestUser' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText(/Replying to YOU/i)).toBeDefined();
    expect(screen.getByText('Should we breach the subnet now?')).toBeDefined();
    expect(screen.getByText('I agree with your strategy!')).toBeDefined();
  });

  it('renders pinned banner and pinned badge for pinned transmissions', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1'] },
      messages: [
        {
          id: 'msg_pin_1',
          roomId: 'room_1',
          senderId: 'u1',
          senderName: 'TestUser',
          content: 'Important network access protocols',
          isPinned: true,
          createdAt: new Date().toISOString(),
          readReceipts: ['u1'],
        },
      ],
      typingUsers: [],
      contacts: [],
      loadingMessages: false,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText(/PINNED:/i)).toBeDefined();
    expect(screen.getAllByText(/Important network access protocols/i).length).toBe(2);
    expect(screen.getByText('PINNED')).toBeDefined();
  });

  it('renders forwarded message header with original sender name and avatar', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1', 'u2'] },
      messages: [
        {
          id: 'msg_fwd_1',
          roomId: 'room_1',
          senderId: 'u1',
          senderName: 'V_Netrunner',
          content: 'Forwarded classified blueprints',
          isForwarded: true,
          forwardedFrom: {
            senderId: 'u2',
            senderName: 'Alt_Cunningham',
            senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          },
          createdAt: new Date().toISOString(),
          readReceipts: ['u1'],
        },
      ],
      typingUsers: [],
      contacts: [],
      loadingMessages: false,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText(/Forwarded from/i)).toBeDefined();
    expect(screen.getByText('Alt_Cunningham')).toBeDefined();
    expect(screen.getByText('Forwarded classified blueprints')).toBeDefined();
    const avatarImg = screen.getByAltText('Alt_Cunningham');
    expect(avatarImg).toBeDefined();
    expect(avatarImg.getAttribute('src')).toContain('photo-1544005313-94ddf0286df2');
  });

  it('renders multi-pin button and opens pinned list modal on click', () => {
    const mockPinMessage = vi.fn();
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1', 'u2'] },
      messages: [
        {
          id: 'msg_pin_1',
          roomId: 'room_1',
          senderId: 'u1',
          senderName: 'TestUser',
          content: 'First pinned rule',
          isPinned: true,
          createdAt: new Date().toISOString(),
          readReceipts: ['u1'],
        },
        {
          id: 'msg_pin_2',
          roomId: 'room_1',
          senderId: 'u2',
          senderName: 'Johnny_Silverhand',
          content: 'Second pinned security directive',
          isPinned: true,
          createdAt: new Date().toISOString(),
          readReceipts: ['u1', 'u2'],
        },
      ],
      typingUsers: [],
      contacts: [],
      loadingMessages: false,
      pinMessage: mockPinMessage,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText(/PINNED \(1\/2\):/i)).toBeDefined();
    const viewAllBtn = screen.getByRole('button', { name: /View All \(2\)/i });
    expect(viewAllBtn).toBeDefined();

    // Click to open Pinned Messages List Dialog
    fireEvent.click(viewAllBtn);

    expect(screen.getByText(/PINNED TRANSMISSIONS \(2\)/i)).toBeDefined();
    expect(screen.getAllByText('First pinned rule').length).toBe(2);
    expect(screen.getAllByText('Second pinned security directive').length).toBe(2);
    expect(screen.getByRole('button', { name: /Unpin All \(2\)/i })).toBeDefined();
  });

  it('renders in-chat system message for pinned transmissions inside chat area', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1', 'u2'] },
      messages: [
        {
          id: 'msg_1',
          roomId: 'room_1',
          senderId: 'u1',
          senderName: 'TestUser',
          content: 'Important security announcement',
          isPinned: true,
          createdAt: new Date().toISOString(),
          readReceipts: ['u1'],
        },
        {
          id: 'sys_pin_1',
          roomId: 'room_1',
          isSystem: true,
          type: 'system',
          pinnedMessageId: 'msg_1',
          pinnerId: 'u1',
          pinnerName: 'TestUser',
          content: 'You pinned the message "Important security announcement"',
          createdAt: new Date().toISOString(),
        },
      ],
      typingUsers: [],
      contacts: [],
      loadingMessages: false,
    });
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u1' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText('You pinned the message "Important security announcement"')).toBeDefined();
    // Exactly one single sentence statement
    expect(screen.getAllByText(/pinned the message/i).length).toBe(1);
  });

  it('renders pinned transmission message correctly for other user as one single sentence', () => {
    vi.mocked(useChat).mockReturnValue({
      activeRoom: { id: 'room_1', name: 'general-grid', type: 'channel', members: ['u1', 'u2'] },
      messages: [
        {
          id: 'msg_1',
          roomId: 'room_1',
          senderId: 'u1',
          senderName: 'Alice',
          content: 'Server update tonight',
          isPinned: true,
          createdAt: new Date().toISOString(),
          readReceipts: ['u1'],
        },
        {
          id: 'sys_pin_1',
          roomId: 'room_1',
          isSystem: true,
          type: 'system',
          pinnedMessageId: 'msg_1',
          pinnerId: 'u1',
          pinnerName: 'Alice',
          snippet: 'Server update tonight',
          content: 'Alice pinned the message "Server update tonight"',
          createdAt: new Date().toISOString(),
        },
      ],
      typingUsers: [],
      contacts: [],
      loadingMessages: false,
    });
    // Current user is Bob (u2)
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'u2', name: 'Bob' } });

    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <ChatArea onToggleRightPanel={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText('Alice pinned the message "Server update tonight"')).toBeDefined();
    expect(screen.getAllByText(/pinned the message/i).length).toBe(1);
  });
});
