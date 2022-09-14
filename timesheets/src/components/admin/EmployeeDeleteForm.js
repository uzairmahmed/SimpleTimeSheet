
import React, { useState } from 'react'
import {
    Button,
    Center,
    useToast

} from '@chakra-ui/react'

import { deleteUserData } from '../../functions/FirebaseFunctions';

export default function TimesheetAdminView(props) {
    const [isLoading, setisLoading] = useState(false);
    const toast = useToast()

    async function handleSubmit(id) {
        setisLoading(true)
        await deleteUserData(id).then((val)=>{
            if (val){
                toast({
                    title: 'Deleted Employee',
                    status: 'success',
                    duration: 2500,
                    isClosable: true,
                  })
            } else {
                console.log(val)
                toast({
                    title: 'Error',
                    description: val,
                    status: 'error',
                    duration: 6500,
                    isClosable: true,
                  })
            }
        })
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