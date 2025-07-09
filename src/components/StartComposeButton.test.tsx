import { clearMocks } from "@tauri-apps/api/mocks";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { StartComposeButton } from "./StartComposeButton";
import { act, render } from "@testing-library/react";
import { mockIPC } from "../test/mockIPCMine";

describe('StartComposeButton Component', async () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearMocks();
    })

    test('calls start_compose with correct stack name', async () => {
        const stackName = "test-stack";
        mockIPC(()=>{});
        const spy = vi.spyOn(window.__TAURI_INTERNALS__, 'invoke').mockResolvedValue(undefined);

        const { getByRole } = render(<StartComposeButton stackName={stackName} />);
        const startButton = getByRole('button', { name: `Start ${stackName}` });

        await act(async () => {
            startButton.click();
        });

        expect(spy).toHaveBeenCalledWith("start_compose", { 'stackName': stackName }, undefined);;
    });
});