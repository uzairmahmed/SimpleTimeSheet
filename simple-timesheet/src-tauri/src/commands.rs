use crate::db::{Database, DbState, Employee, TimesheetEntry, CurrentTimesheet};
use tauri::State;

#[tauri::command]
pub async fn get_employees(db: State<'_, DbState>) -> Result<Vec<Employee>, String> {
    let db = db.lock().await;
    db.get_employees()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_employee(
    db: State<'_, DbState>,
    name: String,
    notes: String,
    pay: f64,
) -> Result<String, String> {
    let db = db.lock().await;
    let employee = Employee {
        id: None,
        name,
        notes,
        pay,
    };
    db.create_employee(employee)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_employee(
    db: State<'_, DbState>,
    id: String,
    name: String,
    notes: String,
    pay: f64,
) -> Result<(), String> {
    let db = db.lock().await;
    let employee = Employee {
        id: Some(id.clone()),
        name,
        notes,
        pay,
    };
    db.update_employee(&id, employee)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_employee(db: State<'_, DbState>, id: String) -> Result<(), String> {
    let db = db.lock().await;
    db.delete_employee(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_timesheet_entries(
    db: State<'_, DbState>,
    start_date: String,
    end_date: String,
) -> Result<Vec<TimesheetEntry>, String> {
    let db = db.lock().await;
    db.get_timesheet_entries(&start_date, &end_date)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_employee_timesheet(
    db: State<'_, DbState>,
    employee_id: String,
    start_date: String,
    end_date: String,
) -> Result<Vec<TimesheetEntry>, String> {
    let db = db.lock().await;
    db.get_employee_timesheet(&employee_id, &start_date, &end_date)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_timesheet_entry(
    db: State<'_, DbState>,
    employee_id: String,
    employee_name: String,
    date: String,
    hours: f64,
    notes: String,
) -> Result<String, String> {
    let db = db.lock().await;
    let entry = TimesheetEntry {
        id: None,
        employee_id,
        employee_name,
        date,
        hours,
        notes,
    };
    db.save_timesheet_entry(entry)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_current_timesheet(db: State<'_, DbState>) -> Result<Option<CurrentTimesheet>, String> {
    let db = db.lock().await;
    db.get_current_timesheet()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_current_timesheet(
    db: State<'_, DbState>,
    start_date: String,
    end_date: String,
) -> Result<(), String> {
    let db = db.lock().await;
    db.set_current_timesheet(start_date, end_date)
        .await
        .map_err(|e| e.to_string())
}
