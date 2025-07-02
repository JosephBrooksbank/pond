import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { IContainerStats } from "./dockerTypes";

const useMonitoring = (containerName: string) => {
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

function App() {
	const [dockerStatus, setDockerStatus] = useState(false);
	const authzStatus = useMonitoring("authz-cache");

	const getInitialData = async () => {
		setDockerStatus(await invoke("get_docker_status"));
	}
	useEffect(() => {
		getInitialData();
	}, []);

	return (
		<main className="container">
			<h1>Docker Connection: {dockerStatus ? "Online!" : "Offline"}</h1>
			<h2>AuthZ Status</h2>
			<pre>{JSON.stringify(authzStatus, null, 2)}</pre>
		</main>
	);
}

export default App;
