#[tauri::command]
pub async fn my_custom_command(invoke_message: String) -> String {    
    println!("I was invoked from javascript! Message: {}", invoke_message);
    "Hello from Rust!".into()
}