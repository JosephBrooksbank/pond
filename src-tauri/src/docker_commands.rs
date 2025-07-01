use bollard::Docker;

#[tauri::command]
pub async fn get_docker_status() -> String {
    let docker = Docker::connect_with_local_defaults().unwrap();
    let version = docker.version().await.unwrap().version.unwrap();
    version

}


#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn it_works() {
        let result = get_docker_status().await;
        assert_eq!(result, "28.1.1")
    }
}