import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../components/Sidebar';
import { ThemeProvider } from '@mui/material';
import { cyberpunkTheme } from '../theme/cyberpunkTheme';

// Mock ChatContext
vi.mock('../context/ChatContext', () => ({
  useChat: () => ({
    rooms: [
      { id: 'r1', name: 'general-grid', type: 'channel', unread: 0 },
      { id: 'r2', name: 'Alt_Cunningham', type: 'dm', unread: 1 },
    ],
    activeRoomId: 'r1',
    selectRoom: vi.fn(),
    contacts: [],
  }),
}));

describe('Sidebar Unit Tests', () => {
  it('renders channels and direct messages sections', () => {
    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <Sidebar onOpenCreateGroup={() => {}} onOpenNewDM={() => {}} />
      </ThemeProvider>
    );

    expect(screen.getByText(/CHANNELS/i)).toBeDefined();
    expect(screen.getByText(/DIRECT MESSAGES/i)).toBeDefined();
    expect(screen.getByText('general-grid')).toBeDefined();
    expect(screen.getByText('Alt_Cunningham')).toBeDefined();
  });

  it('filters list based on search term', () => {
    render(
      <ThemeProvider theme={cyberpunkTheme}>
        <Sidebar onOpenCreateGroup={() => {}} onOpenNewDM={() => {}} />
      </ThemeProvider>
    );

    const searchInput = screen.getByPlaceholderText('SEARCH_GRID...');
    fireEvent.change(searchInput, { target: { value: 'general' } });

    expect(screen.getByText('general-grid')).toBeDefined();
    expect(screen.queryByText('Alt_Cunningham')).toBeNull();
  });
});
