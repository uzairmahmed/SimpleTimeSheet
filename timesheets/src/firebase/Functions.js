import { getDatabase, ref, child, get, set, remove } from "firebase/database";

// https://firebase.google.com/docs/database/web/start

export async function getEmployeeList() {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `employees`)).then((snapshot) => {
        if (snapshot.exists()) {
            return (snapshot.val())
        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    });
}

export async function writeUserData(data) {
    const db = getDatabase();
    set(ref(db, 'employees/' + data.id), data);
}

export async function deleteUserData(id) {
    const db = getDatabase();
    remove(ref(db, 'employees/' + id))
}

export async function writeTimesheetData(data) {
    const db = getDatabase();
    data.dates.forEach(function (date, index) {
        set(ref(db, 'timesheets/' + data.id + '/' + index), {
            date:date,
            total:0
        });
    })
}

export async function getTimesheets(){
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `timesheets`)).then((snapshot) => {
        if (snapshot.exists()) {
            return (snapshot.val())
        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    });
}

export async function writeCurrentTimesheet(data) {
    const db = getDatabase();
    // console.log(data)
    set(ref(db, 'current_timesheet'), data);
}

export async function getCurrentTimesheet() {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `current_timesheet`)).then((snapshot) => {
        if (snapshot.exists()) {
            return (snapshot.val())
        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    });
}

export async function getTimesheetData(s_date){
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `timesheets/`+s_date)).then((snapshot) => {
        if (snapshot.exists()) {
            return (snapshot.val())
        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    });
}

export async function getEmployeeData(eID){
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `employees/`+eID)).then((snapshot) => {
        if (snapshot.exists()) {
            return (snapshot.val())
        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    });
}


export async function addEmployeeToTimesheetifNotExists(eID){
    let cTS = await getCurrentTimesheet()
    // console.log(await getTimesheetData(cTS))
    let emp = await getEmployeeData(eID)
    
    const dbRef = ref(getDatabase());
    get(child(dbRef, `timesheets/`+cTS+"/0/"+eID)).then((snapshot) => {
        if (snapshot.exists()) {
            return (snapshot.val())
        } else {
            mapEmployeeToTimesheet(cTS, eID, emp.name, emp.notes, emp.pay)
            return []
        }
    }).catch((error) => {
        console.error(error);
    });  
    return cTS
}

export async function mapEmployeeToTimesheet(s_date, eID, eName, eNotes, ePay){
    const db = getDatabase();

    for(let i = 0; i<14; i++){
        set(ref(db, 'timesheets/'+s_date+"/"+i+"/"+eID), 
        {
            id: eID,
            name: eName,
            notes: eNotes,
            pay: ePay
        });
    }
}

export async function getEmployeeTimesheet(s_date, idx, eID){
    const dbRef = ref(getDatabase());
    return get(child(dbRef, 'timesheets/'+s_date+"/"+idx+"/"+eID)).then((snapshot) => {
        if (snapshot.exists()) {
            return (snapshot.val())
        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    });
}

export async function writeHoursToEmployeeTimesheet(s_date, idx, eID, payload){
    const db = getDatabase();
    const dbRef = ref(db);

    await set(ref(db, 'timesheets/'+s_date+"/"+idx+"/"+eID), payload);
    return get(child(dbRef, 'timesheets/'+s_date+"/"+idx+"/total")).then(async (snapshot) => {
        // return get(child(dbRef, 'timesheets/'+s_date+"/"+idx+"/total").then(async (snapshot) => {
        if (snapshot.exists()) {
            let tempVal = snapshot.val() + payload.total
            console.log(snapshot.val())
            await set(ref(db, 'timesheets/'+s_date+"/"+idx+"/total"), tempVal);

        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    })
    
}