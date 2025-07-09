use std::process::Command;



#[tauri::command]
pub fn start_compose(stack_name: String) -> i32{

	println!("Starting compose");
	let output = Command::new("docker")
		.arg("compose")
		.arg("-f")
		.arg("C:\\git\\conflict-of-interest\\docker-compose\\docker-compose.yml")
		.arg("--env-file")
		.arg("C:\\git\\conflict-of-interest\\docker-compose\\.env")
		.arg("up")
		.arg("--build")
		.arg("-d")
		.output()
		.expect("Failed to execute command");

	println!("Finished compose");
	return output.status.code().unwrap_or(-1);
}