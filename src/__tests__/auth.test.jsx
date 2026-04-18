/* eslint-disable no-unused-vars */
/* eslint-env jest */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/authContext.jsx';
import SignIn from '../components/authentication/SignIn';

// Mock axios
jest.mock('../axiosConfig', () => ({
  default: {
    post: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('SignIn Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
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

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('submits form with valid credentials', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      username: 'Test User',
      role: 'advocate',
    });
    require('../axiosConfig').default.post.mockImplementation(() =>
      Promise.resolve({
        data: {
          id: 1,
          email: 'test@example.com',
          username: 'Test User',
          role: 'advocate',
          tokens: JSON.stringify({ access: 'token123', refresh: 'refresh123' }).replace(/"/g, "'"),
        },
      })
    );

    // Re-render with mocked login
    renderWithProviders(<SignIn />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(require('../axiosConfig').default.post).toHaveBeenCalledWith('/auth/login/', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('shows error on failed login', async () => {
    require('../axiosConfig').default.post.mockRejectedValue(new Error('Invalid credentials'));

    renderWithProviders(<SignIn />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Error message should appear (implementation dependent)
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  test('validates required fields', () => {
    renderWithProviders(<SignIn />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Form should have required attribute
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  test('password field toggles visibility', () => {
    renderWithProviders(<SignIn />);
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = passwordInput.parentElement.querySelector('span');

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});
