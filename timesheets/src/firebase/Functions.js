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