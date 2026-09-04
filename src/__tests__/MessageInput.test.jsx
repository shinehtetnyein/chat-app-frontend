import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MessageInput } from '../components/MessageInput';
import { ThemeProvider } from '@mui/material';
import { cyberpunkTheme } from '../theme/cyberpunkTheme';
import { useChat } from '../context/ChatContext';

const { mockShowToast } = vi.hoisted(() => ({
  mockShowToast: vi.fn(),
}));

vi.mock('../context/ChatContext', () => ({
  useChat: vi.fn(),
}));

describe('MessageInput Unit Tests', () => {
  beforeEach(() => {
    vi.mocked(useChat).mockReturnValue({
      sendMessage: vi.fn(),
      emitTyping: vi.fn(),
      uploadFileToS3: vi.fn().mockResolvedValue('http://s3.aws.com/mock.png'),
      showToast: mockShowToast,
    });
  });

  it('renders input composer field cleanly', () => {
    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <MessageInput />
      </ThemeProvider>
    );

    const inputEl = screen.getByPlaceholderText('TRANSMIT_MESSAGE...');
    expect(inputEl).toBeDefined();
  });

  it('updates text value when typed into', () => {
    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <MessageInput />
      </ThemeProvider>
    );

    const inputEl = screen.getByPlaceholderText('TRANSMIT_MESSAGE...');
    fireEvent.change(inputEl, { target: { value: 'Hello Netrunners' } });
    expect(inputEl.value).toBe('Hello Netrunners');
  });

  it('shows a toast and preview fallback when file upload fails', async () => {
    mockShowToast.mockReset();

    const uploadFileToS3 = vi.fn().mockRejectedValue(new Error('upload failed'));
    vi.mocked(useChat).mockReturnValue({
      sendMessage: vi.fn(),
      emitTyping: vi.fn(),
      uploadFileToS3,
      showToast: mockShowToast,
    });

    const { container } = render(
      <ThemeProvider theme={cyberpunkTheme}>
        <MessageInput />
      </ThemeProvider>
    );

    const input = container.querySelector('input[type="file"]');
    const file = new File(['image bytes'], 'fallback.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Attachment upload failed. Using local preview instead.', 'warning');
    });

    expect(screen.getByText('fallback.png')).toBeDefined();
  });

  it('exposes accessible labels for attachment and send controls', () => {
    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <MessageInput />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /attach file/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDefined();
  });
});
