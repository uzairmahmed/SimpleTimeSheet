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
        set(ref(db, 'timesheets/' + data.id + '/' + index), date);
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