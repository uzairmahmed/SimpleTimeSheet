import React, { useState } from 'react'

import UserPage from './UserPage'
import WhoopsPage from './WhoopsPage'

export default function Main() {
    const [page, currentPage] = useState(0)

    function navigatePage(num) {
        currentPage(num)
        // console.log(num)
    }

    if (page === 0) {
        return (
            <UserPage navigatePage={(num) => navigatePage(num)} />
        )
    }
    else {
        return (
            <WhoopsPage />
        )
    }

}

