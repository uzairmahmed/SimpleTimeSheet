use mongodb::{Client, Collection, bson::doc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Employee {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub name: String,
    pub notes: String,
    pub pay: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimesheetEntry {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub employee_id: String,
    pub employee_name: String,
    pub date: String,
    pub hours: f64,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CurrentTimesheet {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub start_date: String,
    pub end_date: String,
}

pub struct Database {
    client: Client,
}

impl Database {
    pub async fn new(connection_string: &str) -> Result<Self, mongodb::error::Error> {
        let client = Client::with_uri_str(connection_string).await?;
        Ok(Database { client })
    }

    fn employees_collection(&self) -> Collection<Employee> {
        self.client
            .database("timesheet")
            .collection("employees")
    }

    fn timesheet_entries_collection(&self) -> Collection<TimesheetEntry> {
        self.client
            .database("timesheet")
            .collection("timesheet_entries")
    }

    fn current_timesheet_collection(&self) -> Collection<CurrentTimesheet> {
        self.client
            .database("timesheet")
            .collection("current_timesheet")
    }

    // Employee operations
    pub async fn get_employees(&self) -> Result<Vec<Employee>, mongodb::error::Error> {
        let collection = self.employees_collection();
        let mut cursor = collection.find(doc! {}).await?;
        let mut employees = Vec::new();
        
        use futures::stream::TryStreamExt;
        
        while let Some(employee) = cursor.try_next().await? {
            employees.push(employee);
        }
        
        Ok(employees)
    }

    pub async fn create_employee(&self, employee: Employee) -> Result<String, mongodb::error::Error> {
        let collection = self.employees_collection();
        let result = collection.insert_one(employee).await?;
        Ok(result.inserted_id.to_string())
    }

    pub async fn update_employee(&self, id: &str, employee: Employee) -> Result<(), mongodb::error::Error> {
        let collection = self.employees_collection();
        let filter = doc! { "_id": id };
        let update = doc! {
            "$set": {
                "name": employee.name,
                "notes": employee.notes,
                "pay": employee.pay,
            }
        };
        collection.update_one(filter, update).await?;
        Ok(())
    }

    pub async fn delete_employee(&self, id: &str) -> Result<(), mongodb::error::Error> {
        let collection = self.employees_collection();
        let filter = doc! { "_id": id };
        collection.delete_one(filter).await?;
        Ok(())
    }

    // Timesheet operations
    pub async fn get_timesheet_entries(&self, start_date: &str, end_date: &str) -> Result<Vec<TimesheetEntry>, mongodb::error::Error> {
        let collection = self.timesheet_entries_collection();
        let filter = doc! {
            "date": {
                "$gte": start_date,
                "$lte": end_date,
            }
        };
        let mut cursor = collection.find(filter).await?;
        let mut entries = Vec::new();
        
        use futures::stream::TryStreamExt;
        
        while let Some(entry) = cursor.try_next().await? {
            entries.push(entry);
        }
        
        Ok(entries)
    }

    pub async fn get_employee_timesheet(&self, employee_id: &str, start_date: &str, end_date: &str) -> Result<Vec<TimesheetEntry>, mongodb::error::Error> {
        let collection = self.timesheet_entries_collection();
        let filter = doc! {
            "employee_id": employee_id,
            "date": {
                "$gte": start_date,
                "$lte": end_date,
            }
        };
        let mut cursor = collection.find(filter).await?;
        let mut entries = Vec::new();
        
        use futures::stream::TryStreamExt;
        
        while let Some(entry) = cursor.try_next().await? {
            entries.push(entry);
        }
        
        Ok(entries)
    }

    pub async fn save_timesheet_entry(&self, entry: TimesheetEntry) -> Result<String, mongodb::error::Error> {
        let collection = self.timesheet_entries_collection();
        
        // Try to find existing entry for this employee and date
        let filter = doc! {
            "employee_id": &entry.employee_id,
            "date": &entry.date,
        };
        
        let existing = collection.find_one(filter.clone()).await?;
        
        if existing.is_some() {
            // Update existing entry
            let update = doc! {
                "$set": {
                    "hours": entry.hours,
                    "notes": &entry.notes,
                }
            };
            collection.update_one(filter, update).await?;
            Ok(entry.employee_id)
        } else {
            // Insert new entry
            let result = collection.insert_one(entry).await?;
            Ok(result.inserted_id.to_string())
        }
    }

    // Current timesheet operations
    pub async fn get_current_timesheet(&self) -> Result<Option<CurrentTimesheet>, mongodb::error::Error> {
        let collection = self.current_timesheet_collection();
        let result = collection.find_one(doc! {}).await?;
        Ok(result)
    }

    pub async fn set_current_timesheet(&self, start_date: String, end_date: String) -> Result<(), mongodb::error::Error> {
        let collection = self.current_timesheet_collection();
        
        // Delete any existing current timesheet
        collection.delete_many(doc! {}).await?;
        
        // Insert new current timesheet
        let current = CurrentTimesheet {
            id: None,
            start_date,
            end_date,
        };
        collection.insert_one(current).await?;
        Ok(())
    }
}

pub type DbState = Arc<Mutex<Database>>;
