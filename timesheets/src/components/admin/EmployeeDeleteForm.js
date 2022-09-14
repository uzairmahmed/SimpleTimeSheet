
import React, { useState } from 'react'
import {
    Button,
    Center,
} from '@chakra-ui/react'

import { deleteUserData } from '../../functions/Functions';

export default function TimesheetAdminView(props) {
    const [isLoading, setisLoading] = useState(false);

    async function handleSubmit(id) {
        setisLoading(true)
        await deleteUserData(id)
        setisLoading(false)
        props.onclose()
    }

    return (
        <Center>
            <Button
                onClick={() => props.onclose()}
                m={5}
                type='submit'
                colorScheme='teal'
                variant='outline'
            >
                Cancel 
            </Button>
            <Button
                onClick={() => handleSubmit(props.employee.id)}
                p={5}
                type='submit'
                isLoading={isLoading}
                loadingText='Deleting'
                colorScheme='blue'
                variant='solid'
            >
                Delete Employee 
            </Button>
        </Center>
    )
}