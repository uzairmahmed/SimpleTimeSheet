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
        return error.message
    });
}

export async function writeUserData(data) {
    const db = getDatabase();
    return set(ref(db, 'employees/' + data.id), data).then(() => {
        return true
    }).catch(error => {
        return error.message
    })
}

export async function deleteUserData(id) {
    const db = getDatabase();
    return remove(ref(db, 'employees/' + id)).then(() => {
        return true
    }).catch(error => {
        return error.message
    })
}

export async function writeTimesheetData(data) {
    const db = getDatabase();
    return await data.dates.forEach(async (date, index) => {
        return await set(ref(db, 'timesheets/' + data.id + '/' + index), {
            date:date,
            total:0
        }).then(() => {
            return true
        }).catch(error => {
            return error.message
        })
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
        return error.message
    });
}

export async function writeCurrentTimesheet(data) {
    const db = getDatabase();
    // console.log(data)
    return set(ref(db, 'current_timesheet'), data).then(() => {
        return true
    }).catch(error => {
        return error.message
    });
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
        return error.message
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
        return error.message
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
        return error.message
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
        return error.message
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
        }).catch(error => {
            return error.message
        })
    }
    return true
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
        return error.message
    });
}

export async function writeHoursToEmployeeTimesheet(s_date, idx, eID, payload){
    const db = getDatabase();
    await set(ref(db, 'timesheets/'+s_date+"/"+idx+"/"+eID), payload).catch(error => {
        return error.message
    })
    updateTotalHours(s_date).catch(error => {
        return error.message
    })
    return true
}

export async function updateTotalHours(s_date){
    const db = getDatabase();
    const dbRef = ref(db);

    return get(child(dbRef, 'timesheets/'+s_date)).then(async (snapshot) => {
        if (snapshot.exists()) {
            // console.log(snapshot.val())
            snapshot.val().forEach(async function (day, idx){
                // console.log(day.total)
                let tt = 0
                Object.keys(day).forEach(function (emp){
                    if (typeof day[emp] === 'object'){
                        if (day[emp].total){
                            tt += parseFloat(day[emp].total)
                        }
                    }
                })
                await set(ref(db, 'timesheets/'+s_date+"/"+idx+"/total"), tt);
            })
        }
        return true
    }).catch((error) => {
        console.error(error)
        return error.message
    })
    }