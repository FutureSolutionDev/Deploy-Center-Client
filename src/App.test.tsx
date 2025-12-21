import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
    return {
        io: vi.fn(() => ({
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            connect: vi.fn(),
            disconnect: vi.fn(),
            connected: false,
        })),
        default: vi.fn(() => ({
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            connect: vi.fn(),
            disconnect: vi.fn(),
            connected: false,
        })),
    };
});

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Verify that the login page is rendered (since we are not authenticated)
        // We look for text present in the Login Page
        expect(screen.getByText(/Deploy Center/i)).toBeInTheDocument();
    });
});
