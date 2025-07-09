use std::sync::Mutex;

use bollard::{query_parameters::StatsOptionsBuilder, Docker};
use futures_util::stream::StreamExt;
use tauri::{AppHandle, Emitter, Manager};

use crate::{AppState, MonitorData};

fn connect() -> Docker {
    Docker::connect_with_defaults().unwrap()
}

#[tauri::command]
pub async fn get_docker_status() -> bool {
    let docker = connect();

    let ping_response = match docker.ping().await {
        Ok(_) => true,
        Err(_) => false,
    };

    ping_response
}

#[derive(Clone, serde::Serialize, Debug)]
struct ContainerStats {
    name: String,
    total_cpu: Option<u64>,
    total_mem: Option<u64>,
}

pub async fn monitor_container(
    app: AppHandle,
    container_name: &str,
    recv: std::sync::mpsc::Receiver<String>,
) {
    let docker = connect();
    let stream = &mut docker.stats(
        container_name,
        Some(StatsOptionsBuilder::default().stream(true).build()),
    );

    while let Some(Ok(stat)) = stream.next().await {
        let payload = ContainerStats {
            name: stat.name.as_ref().unwrap().clone(),
            total_cpu: stat
                .cpu_stats
                .as_ref()
                .unwrap()
                .cpu_usage
                .as_ref()
                .unwrap()
                .total_usage,
            total_mem: stat.memory_stats.as_ref().unwrap().usage,
        };
        println!("{:?}", payload);
        app.emit(format!("{}-stats", container_name).as_str(), payload)
            .unwrap();
    }
}

#[tauri::command]
pub async fn start_monitoring(app: AppHandle, container_name: String) {
    let state = app.state::<Mutex<AppState>>();
    let mut state = state.lock().unwrap();

    if state.monitors.contains_key(&container_name) {
        println!("Already monitoring container: {}", container_name);
        return;
    }

    println!("Starting the monitoring");
    let (send, recv) = std::sync::mpsc::channel();
    let handle = tauri::async_runtime::spawn({
        let container_name = container_name.clone();
        let app = app.clone();
        async move {
            let app = app.clone();
            monitor_container(app, &container_name, recv).await;
        }
    });

    let monitor_data = MonitorData { handle, send };
    state.monitors.insert(container_name, monitor_data);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn it_works() {
        let result = get_docker_status().await;
        assert_eq!(result, true)
    }
}
