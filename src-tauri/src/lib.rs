use std::{collections::HashMap, sync::{mpsc, Mutex} };

use tauri::{async_runtime::JoinHandle, Manager};

mod commands;
mod docker_commands;
mod compose_commands;

struct MonitorData {
	handle: JoinHandle<()>,
	send: mpsc::Sender<String>,
}

struct AppState{
	monitors: HashMap<String, MonitorData>
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_opener::init())
		.invoke_handler(tauri::generate_handler![
			commands::my_custom_command,
			docker_commands::get_docker_status,
			docker_commands::start_monitoring,
			compose_commands::start_compose,
		])
		.setup(|app| {
			app.manage(Mutex::new(AppState {
				monitors: HashMap::new(),
			}));
			Ok(())
		})
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
