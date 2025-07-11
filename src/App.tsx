import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { StartComposeButton } from "./components/StartComposeButton";
import { Card, CardContainer } from "./components/Card";
import { ContainerStatusWidget, WidgetContainer } from "./components/ContainerStatusWidget";


function App() {
	const [dockerStatus, setDockerStatus] = useState(false);

	const getInitialData = async () => {
		setDockerStatus(await invoke("get_docker_status"));
	}
	useEffect(() => {
		getInitialData();
	}, []);

	return (
		<main className="">
			<h1>Docker Connection: {dockerStatus ? "Online!" : "Offline"}</h1>
			<CardContainer>
				<Card>
					<h2>Conflict Of Interest</h2>
					<WidgetContainer>
						<ContainerStatusWidget containerName="coi-api" />
						<ContainerStatusWidget containerName="coi-ui" />
						<ContainerStatusWidget containerName="coi-db"/>
					</WidgetContainer>
					<StartComposeButton stackName="conflict-of-interest" />
				</Card>
				<Card>
					<h2>AuthZ</h2>
					<WidgetContainer>
						<ContainerStatusWidget containerName="authz-cache" />
					</WidgetContainer>
				</Card>
			</CardContainer>
		</main>
	);
}

export default App;
