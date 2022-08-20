import { getDatabase, ref, child, get, set } from "firebase/database";

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
    console.log(data.id)
    set(ref(db, 'employees/' + data.id), data);
}