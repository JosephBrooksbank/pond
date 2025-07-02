import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'
import App from './App'
import { mockIPC } from './test/mockIPCMine'
import { emit } from '@tauri-apps/api/event'

describe('App Component', async () => {
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

	// write test for authz-cache stats event emit
	test('renders authz-cache stats', async () => {

		mockIPC((cmd, _: unknown) => {
			if (cmd === 'get_docker_status') {
				return true; // Simulate Docker being online
			}
		})
		render(<App />);
		act(() => {
			emit('authz-cache-stats', {
				total_cpu: 100,
				total_mem: '2000',
				name: '/authz-cache'
			});
		})

		await waitFor(() => {
			// expect(screen.geByText(/AuthZ Status/i)).toBeInTheDocument();
			expect(screen.getByText(/"name": "\/authz-cache"/i)).toBeInTheDocument();
			expect(screen.getByText(/"total_cpu": 100/i)).toBeInTheDocument();
			expect(screen.getByText(/"total_mem": "2000"/i)).toBeInTheDocument();
		});
	});


})