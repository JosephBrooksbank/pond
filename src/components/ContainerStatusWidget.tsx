import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import { IContainerStats } from "../dockerTypes";

const useMonitoring = (containerName: string): IContainerStats | null => {
	const [stats, setStats] = useState<IContainerStats | null>(null);

	useEffect(() => {
		invoke("start_monitoring", { containerName });
		const unlisten = listen<IContainerStats>(`${containerName}-stats`, (event) => {
			console.log("Received stats:", event);
			setStats(event.payload);
		});

		return () => {
			unlisten.then(f => f());
		};
	}, [containerName]);
	return stats;
}

const ContainerStatusContent = ({containerName}: {containerName: string}) => {
    const stats = useMonitoring(containerName);

    if (!stats) {
        return <div className="text-gray-500">🔃</div>;
    }

    if (!stats.total_cpu || !stats.total_mem) {
        return <div className="text-red-500">❌</div>;
    }
    return (
        <div className="text-green-500">✅</div>
    );
}

export const ContainerStatusWidget = ({containerName}: {containerName: string}) => {
    return (
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg text-center justify-center p-2 mx-2">
            <ContainerStatusContent containerName={containerName} />
        </div>
    );
}


export const WidgetContainer = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="rounded-lg p-4 flex justify-center w-full">
            {children}
        </div>
    );
}