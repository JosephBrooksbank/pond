import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [dockerStatus, setDockerStatus] = useState(false);

  const getInitialData = async () => {
    setDockerStatus(await invoke("get_docker_status"));
  }

  useEffect(() => {
    getInitialData();
  }, [])

  return (
    <main className="container">
      <h1>Docker Connection: {dockerStatus ? "Online!" : "Offline"}</h1>
    </main>
  );
}

export default App;
