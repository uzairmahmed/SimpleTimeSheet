import React, { useState } from 'react'

import HomePage from './HomePage'
import AdminPage from './AdminPage'
import EmployeePage from './EmployeePage'

export default function Main() {
    const [page, currentPage] = useState(0)
    const [employee, setEmployee] = useState(-1);

    function navigatePage(num, emp) {
        currentPage(num)
        if(emp){
            setEmployee(emp)
        }
    }

    if (page === 0) {
        return (
            <HomePage navigatePage={(num, emp) => navigatePage(num, emp)} />
        )
    }
    else if (page === 1) {
        return (
            <AdminPage navigatePage={(num, emp) => navigatePage(num, emp)} />
        )
    }
    else if (page === 2) {
        return (
            <EmployeePage eID={employee} navigatePage={(num, emp) => navigatePage(num, emp)} />
        )
    }

}

