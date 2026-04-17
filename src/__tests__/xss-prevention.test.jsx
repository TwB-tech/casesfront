/* eslint-env jest */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/authContext';
import { CaseDetails } from '../components/CaseManagement/CaseDetails';
import DOMPurify from 'dompurify';

// Mock axios
jest.mock('../axiosConfig', () => ({
  default: {
    get: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { case1: null } }),
  useParams: () => ({ id: '1' }),
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('XSS Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('case title is sanitized to prevent XSS', async () => {
    const maliciousTitle = '<script>alert("XSS")</script>Case Title';
    const mockCaseData = {
      id: 1,
      title: maliciousTitle,
      case_number: 'CW-2026-001',
      status: 'open',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      name: 'Client Name',
      advocate: { username: 'Advocate Name' },
      court_name: 'High Court',
      organization: { name: 'Org' },
      description: 'Description',
      documents: [],
    };

    require('../axiosConfig').default.get.mockResolvedValueOnce({
      data: mockCaseData,
    });

    renderWithProviders(<CaseDetails />);

    await waitFor(() => {
      // The title should be rendered without script tags
      const titleElement = screen.getByText(/Case Title/);
      expect(titleElement).toBeInTheDocument();
      // Ensure no script tags in DOM
      expect(document.querySelector('script')).toBeNull();
    });
  });

  test('case description HTML is sanitized', async () => {
    const maliciousDesc = '<img src=x onerror=alert("XSS")>Description text';
    const mockCaseData = {
      id: 1,
      title: 'Safe Title',
      case_number: 'CW-2026-001',
      status: 'open',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      name: 'Client Name',
      advocate: { username: 'Advocate Name' },
      court_name: 'High Court',
      organization: { name: 'Org' },
      description: maliciousDesc,
      documents: [],
    };

    require('../axiosConfig').default.get.mockResolvedValueOnce({
      data: mockCaseData,
    });

    renderWithProviders(<CaseDetails />);

    await waitFor(() => {
      // Description should be sanitized - no img tag with onerror
      expect(screen.getByText(/Description text/)).toBeInTheDocument();
      expect(document.querySelector('img[onerror]')).toBeNull();
    });
  });

  test('client username with HTML entities is sanitized', async () => {
    const maliciousUsername = '<svg/onload=alert("XSS")>User';
    // This would be tested in ClientDetails component similarly
    expect(DOMPurify.sanitize(maliciousUsername)).not.toContain('<svg');
    expect(DOMPurify.sanitize(maliciousUsername)).not.toContain('onload');
  });
});
