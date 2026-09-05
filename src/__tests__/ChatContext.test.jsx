import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatProvider, useChat, MOCK_TEST_ROOMS, MOCK_TEST_MESSAGES } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../context/SocketContext', () => ({
  useSocket: vi.fn(),
}));

const TestHarness = () => {
  const { messages, sendMessage } = useChat();

  return (
    <div>
      <button onClick={() => sendMessage({ content: 'hello from test' })}>send</button>
      <div data-testid="message-count">{messages.length}</div>
    </div>
  );
};

describe('ChatProvider sendMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rooms: [], users: [], messages: [] }),
    }));
  });

  it('does not duplicate a locally sent message when the socket echoes it back', async () => {
    const listeners = {};
    const socket = {
      emit: vi.fn(),
      on: vi.fn((event, handler) => {
        listeners[event] = handler;
      }),
      off: vi.fn((event) => {
        delete listeners[event];
      }),
      disconnect: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', name: 'me' },
      token: 'abc',
    });
    vi.mocked(useSocket).mockReturnValue({ socket, connected: true });

    render(
      <ChatProvider
        initialRooms={MOCK_TEST_ROOMS}
        initialMessages={MOCK_TEST_MESSAGES}
        initialActiveRoomId="room_cyber_main"
      >
        <TestHarness />
      </ChatProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    const sendPayload = socket.emit.mock.calls.find(([event]) => event === 'message:send')?.[1];
    expect(sendPayload.clientMessageId).toBeDefined();

    await act(async () => {
      listeners['message:new']({
        id: 'server-message-id',
        roomId: 'room_cyber_main',
        clientMessageId: sendPayload.clientMessageId,
        senderId: 'u1',
        senderName: 'me',
        content: 'hello from test',
        createdAt: new Date().toISOString(),
        readReceipts: ['u1'],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('message-count').textContent).toBe('3');
    });
  });

  it('updates message content and isEdited when message:edited socket event is received', async () => {
    const listeners = {};
    const socket = {
      emit: vi.fn(),
      on: vi.fn((event, handler) => {
        listeners[event] = handler;
      }),
      off: vi.fn((event) => {
        delete listeners[event];
      }),
      disconnect: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', name: 'me' },
      token: 'abc',
    });
    vi.mocked(useSocket).mockReturnValue({ socket, connected: true });

    const EditTestHarness = () => {
      const { messages } = useChat();
      const target = messages.find((m) => m.id === 'm1');
      return (
        <div>
          <div data-testid="m1-content">{target?.content}</div>
          <div data-testid="m1-edited">{target?.isEdited ? 'edited' : 'original'}</div>
        </div>
      );
    };

    render(
      <ChatProvider
        initialRooms={MOCK_TEST_ROOMS}
        initialMessages={MOCK_TEST_MESSAGES}
        initialActiveRoomId="room_cyber_main"
      >
        <EditTestHarness />
      </ChatProvider>
    );

    expect(screen.getByTestId('m1-content').textContent).toContain('Welcome to the Nexus Netroom');
    expect(screen.getByTestId('m1-edited').textContent).toBe('original');

    await act(async () => {
      listeners['message:edited']({
        messageId: 'm1',
        roomId: 'room_cyber_main',
        content: 'Updated secure transmission content',
        isEdited: true,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('m1-content').textContent).toBe('Updated secure transmission content');
      expect(screen.getByTestId('m1-edited').textContent).toBe('edited');
    });
  });

  it('marks message as isDeleted and clears content when message:deleted socket event is received', async () => {
    const listeners = {};
    const socket = {
      emit: vi.fn(),
      on: vi.fn((event, handler) => {
        listeners[event] = handler;
      }),
      off: vi.fn((event) => {
        delete listeners[event];
      }),
      disconnect: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'u1', name: 'me' },
      token: 'abc',
    });
    vi.mocked(useSocket).mockReturnValue({ socket, connected: true });

    const DeleteTestHarness = () => {
      const { messages } = useChat();
      const target = messages.find((m) => m.id === 'm1');
      return (
        <div>
          <div data-testid="m1-deleted">{target?.isDeleted ? 'deleted' : 'active'}</div>
          <div data-testid="m1-content">{target?.content}</div>
        </div>
      );
    };

    render(
      <ChatProvider
        initialRooms={MOCK_TEST_ROOMS}
        initialMessages={MOCK_TEST_MESSAGES}
        initialActiveRoomId="room_cyber_main"
      >
        <DeleteTestHarness />
      </ChatProvider>
    );

    expect(screen.getByTestId('m1-deleted').textContent).toBe('active');

    await act(async () => {
      listeners['message:deleted']({
        messageId: 'm1',
        roomId: 'room_cyber_main',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('m1-deleted').textContent).toBe('deleted');
      expect(screen.getByTestId('m1-content').textContent).toBe('');
    });
  });
});
