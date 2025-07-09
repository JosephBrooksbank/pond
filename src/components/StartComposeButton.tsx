import { invoke } from "@tauri-apps/api/core";

interface Props {
    stackName: string;
}

export const StartComposeButton: React.FC<Props> = ({ stackName }) => {
    const startCompose = async () => {
        console.log('starting compose');
        await invoke("start_compose", { stackName });
        console.log('finishing compose');
    }

    return (
        <button onClick={startCompose}>
            Start {stackName}
        </button>
    );
}

