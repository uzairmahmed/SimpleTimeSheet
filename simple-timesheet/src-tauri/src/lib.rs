mod db;
mod commands;

use std::sync::Arc;
use std::env;
use tokio::sync::Mutex;
use db::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Initialize database
      let app_handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
        // Get connection string from environment or use default for development
        let connection_string = env::var("MONGODB_URI")
          .unwrap_or_else(|_| "mongodb://admin:admin123@localhost:27017".to_string());
        
        match Database::new(&connection_string).await {
          Ok(database) => {
            let db_state = Arc::new(Mutex::new(database));
            app_handle.manage(db_state);
            log::info!("Database connected successfully");
          }
          Err(e) => {
            log::error!("Failed to connect to database: {}", e);
          }
        }
      });

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::get_employees,
      commands::create_employee,
      commands::update_employee,
      commands::delete_employee,
      commands::get_timesheet_entries,
      commands::get_employee_timesheet,
      commands::save_timesheet_entry,
      commands::get_current_timesheet,
      commands::set_current_timesheet,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
