import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { IContainerStats } from "./dockerTypes";
import { StartComposeButton } from "./components/StartComposeButton";

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
	const coiApinstatus = useMonitoring("coi-api");

	const getInitialData = async () => {
		setDockerStatus(await invoke("get_docker_status"));
	}
	useEffect(() => {
		getInitialData();
	}, []);

	return (
		<main className="container">
			<h1>Docker Connection: {dockerStatus ? "Online!" : "Offline"}</h1>
			<div className="card">
				<h2>Conflict Of Interest</h2>
				<pre>{JSON.stringify(coiApinstatus, null, 2)}</pre>
				<StartComposeButton stackName="conflict-of-interest"/>
			</div>
			<div className="card">
				<h2>AuthZ Status</h2>
				<pre>{JSON.stringify(authzStatus, null, 2)}</pre>
			</div>
		</main>
	);
}

export default App;
