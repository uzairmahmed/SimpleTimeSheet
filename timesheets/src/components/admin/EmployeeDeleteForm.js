
import React, { useState } from 'react'
import {
    Button,
    Center,
} from '@chakra-ui/react'

import { deleteUserData } from '../../firebase/Functions';

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
                colorScheme='teal'
                isLoading={isLoading}
                loadingText='Deleting'
                variant='outline'
            >
                Delete Employee 
            </Button>
        </Center>
    )
}