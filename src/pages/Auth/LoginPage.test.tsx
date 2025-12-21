import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('@/contexts/AuthContext', async () => {
    return {
        useAuth: () => ({
            isAuthenticated: false,
            login: vi.fn(),
        }),
    };
});

vi.mock('@/contexts/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => key,
    }),
}));

describe('LoginPage', () => {
    it('renders login form correctly', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        // Check for main elements using translation keys (mocked to return key)
        expect(screen.getByText('auth.login')).toBeInTheDocument();
        expect(screen.getByText('auth.loginSubtitle')).toBeInTheDocument();
    });
});
