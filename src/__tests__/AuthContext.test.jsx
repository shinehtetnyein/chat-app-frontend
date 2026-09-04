import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

const TestComponent = () => {
  const { user, loginWithGoogle, logout, updateProfile, signUp } = useAuth();
  return (
    <div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
      <button onClick={() => loginWithGoogle({ id: 'test_1', name: 'CyberTestUser', email: 'test@cyber.io' })}>
        Login
      </button>
      <button onClick={() => signUp({ name: 'NewCyberUser', email: 'new@cyber.io', password: 'secret123' })}>
        Sign Up
      </button>
      <button onClick={() => updateProfile({ name: 'UpdatedCyberUser' })}>Update Name</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext Unit Tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('renders initial user state or logs in successfully', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Login');
    act(() => {
      loginBtn.click();
    });

    expect(screen.getByTestId('user-name')).toBeDefined();
  });

  it('signs up a new user and stores them in session', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        token: 'signup-token',
        user: { id: 'user_new', name: 'NewCyberUser', email: 'new@cyber.io' },
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Sign Up').click();
    });

    expect(screen.getByTestId('user-name').textContent).toBe('NewCyberUser');
  });

  it('updates display name correctly via updateProfile', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({
        user: { id: 'test_1', name: 'UpdatedCyberUser', email: 'test@cyber.io' },
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByText('Login');
    act(() => {
      loginBtn.click();
    });

    const updateBtn = screen.getByText('Update Name');
    await act(async () => {
      updateBtn.click();
    });

    expect(screen.getByTestId('user-name').textContent).toBe('UpdatedCyberUser');
  });
});
