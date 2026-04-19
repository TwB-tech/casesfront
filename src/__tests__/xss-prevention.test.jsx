import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ThemeProvider from '../contexts/ThemeContext.jsx';
import CaseDetails from '../components/CaseManagement/CaseDetails';
import DOMPurify from 'dompurify';
import { vi } from 'vitest';

const { mockGet, mockNavigate } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('../axiosConfig', () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { case1: null } }),
    useParams: () => ({ id: '1' }),
  };
});

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>{component}</ThemeProvider>
    </BrowserRouter>
  );
};

describe('XSS Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test(
    'case title is sanitized to prevent XSS',
    async () => {
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

    mockGet.mockResolvedValueOnce({
      data: mockCaseData,
    });

      renderWithProviders(<CaseDetails />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/case/1/');
        expect(document.body.textContent).toContain('Case Title');
        expect(document.querySelector('script')).toBeNull();
      });
    },
    15000
  );

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

    mockGet.mockResolvedValueOnce({
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
    const sanitized = DOMPurify.sanitize(maliciousUsername, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });

    expect(sanitized).toBe('');
    expect(sanitized).not.toContain('onload');
  });
});
