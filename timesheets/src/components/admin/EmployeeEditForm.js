import {
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Input,
    Button,
} from '@chakra-ui/react'

import React, { useState, useEffect } from 'react'
import paddings from '../../styles/styles'

import TimesheetAdminChart from './TimesheetChart'
import { writeUserData } from '../../firebase/Functions';

export default function TimesheetAdminView(props) {
    const [data, setdata] = useState([]);
    const [isLoading, setisLoading] = useState(false);

    const [name, setname] = useState(props.employee.name);
    const [pay, setpay] = useState(props.employee.pay);
    const [id, setid] = useState(props.employee.id);
    const [notes, setNotes] = useState(props.employee.notes);


    const testEmployeeList = [
        {
            "name": "Uzair Ahmed",
            "id": 12312312312,
            "pay": 21,
            "notes": ""
        },
        {
            "name": "Shiza Ahmed",
            "id": 12312312312,
            "pay": 14,
            "notes": ""
        }
    ]

    useEffect(() => {
        setdata(testEmployeeList)
        console.log(data)
    }, []);

    async function handleSubmit() {
        setisLoading(true)
        // await writeUserData ()
        setisLoading(false)
    }

    return (
        <>
            <FormControl>
                <FormLabel>Name</FormLabel>
                <Input defaultValue={props.employee.name} type='text' />
            </FormControl>
            <FormControl>
                <FormLabel>Pay</FormLabel>
                <NumberInput defaultValue={props.employee.pay}>
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </FormControl>
            <FormControl>
                <FormLabel>Employee ID</FormLabel>
                <Input defaultValue={props.employee.id} type='text' />
            </FormControl>
            <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input defaultValue={props.employee.notes} type='text' />
            </FormControl>
            <Button
                onClick={() => handleSubmit()}
                isLoading={isLoading}
                loadingText='Saving'
                colorScheme='teal'
                variant='outline'
            >
                Save
            </Button>
        </>
    )
}