import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { mockIPC } from '@tauri-apps/api/mocks'
import '@testing-library/jest-dom'
import App from './App'


describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    test('renders correctly when offline', () => {
        mockIPC((cmd, _) => {
            if (cmd === 'get_docker_status') {
                return false; // Simulate Docker being offline
            }
        })
        render(<App />);
        expect(screen.getByText(/Docker Connection: Offline/i)).toBeInTheDocument();
    });

    test('renders correctly when online', async () => {
        mockIPC((cmd, _) => {
            if (cmd === 'get_docker_status') {
                return true; // Simulate Docker being online
            }
        })
        render(<App />);
        // Wait for the async update to complete
        await waitFor(() => {
            expect(screen.getByText(/Docker Connection: Online/i)).toBeInTheDocument();
        });
    });
})