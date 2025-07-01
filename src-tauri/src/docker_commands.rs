use bollard::Docker;

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


#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn it_works() {
        let result = get_docker_status().await;
        assert_eq!(result, true)
    }
}