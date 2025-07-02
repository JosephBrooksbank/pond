use bollard::{query_parameters::StatsOptionsBuilder, Docker};
use futures_util::stream::StreamExt;
use tauri::{AppHandle, Emitter};

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
    total_mem: Option<u64>
}

pub async fn monitor_container(app: AppHandle, container_name: String) {
    println!("from the thread");
    let docker = connect();
    let stream = &mut docker
        .stats(
            &container_name,
            Some(StatsOptionsBuilder::default().stream(true).build()),
        );


    while let Some(Ok(stat)) = stream.next().await {
        let payload = ContainerStats {
            name: stat.name.as_ref().unwrap().clone(),
            total_cpu: stat.cpu_stats.as_ref().unwrap().cpu_usage.as_ref().unwrap().total_usage,
            total_mem: stat.memory_stats.as_ref().unwrap().usage
        };
        println!("{:?}", payload);
        app.emit(format!("{}-stats", container_name).as_str(), payload).unwrap();
    }
}

#[tauri::command]
pub async fn start_monitoring(app: AppHandle, container_name: String) {
    println!("Starting the monitoring");
    tauri::async_runtime::spawn(async move {
        monitor_container(app, container_name).await;
    });
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
