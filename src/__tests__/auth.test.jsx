import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/authContext.jsx';
import ThemeProvider from '../contexts/ThemeContext.jsx';
import SignIn from '../components/authentication/SignIn';
import { vi } from 'vitest';

const { mockNavigate, mockPost, messageApi } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockPost: vi.fn(),
  messageApi: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../axiosConfig', () => ({
  default: {
    post: mockPost,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: messageApi,
  };
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>{component}</AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('SignIn Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockPost.mockReset();
    messageApi.success.mockReset();
    messageApi.error.mockReset();
    localStorage.clear();
  });

  test('renders sign in form', () => {
    renderWithProviders(<SignIn />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('allows user to enter email and password', () => {
    renderWithProviders(<SignIn />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('submits form with valid credentials', async () => {
    mockPost.mockResolvedValue({
      data: {
        id: 1,
        email: 'test@example.com',
        username: 'Test User',
        role: 'advocate',
        organization_id: null,
        tokens: JSON.stringify({ access: 'token123', refresh: 'refresh123' }).replace(/"/g, "'"),
      },
    });

    renderWithProviders(<SignIn />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login/', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(messageApi.success).toHaveBeenCalledWith('Login successful!');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('shows error on failed login', async () => {
    mockPost.mockRejectedValue(new Error('Invalid credentials'));

    renderWithProviders(<SignIn />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(messageApi.error).toHaveBeenCalledWith('Login failed!');
    });
  });

  test('validates required fields', () => {
    renderWithProviders(<SignIn />);

    expect(screen.getByLabelText(/email/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('required');
  });

  test('password field toggles visibility', () => {
    renderWithProviders(<SignIn />);
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = passwordInput.parentElement.querySelector('span');

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
