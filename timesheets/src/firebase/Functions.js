import { getDatabase, ref, child, get } from "firebase/database";


async function getEmployeeList() {
    const dbRef = ref(getDatabase());
    return get(child(dbRef, `employees`)).then((snapshot) => {
        if (snapshot.exists()) {
            return(snapshot.val())
        } else {
            return []
        }
    }).catch((error) => {
        console.error(error);
    });
}

export default getEmployeeList