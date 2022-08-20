
import React, { useEffect, useState } from 'react'
import { Formik, Form, Field } from 'formik';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Center,
    FormHelperText,
    FormErrorMessage,
} from '@chakra-ui/react'

import { SingleDatepicker } from 'chakra-dayzed-datepicker';

import { writeTimesheetData } from '../../firebase/Functions';

export default function TimesheetAdminView(props) {
    const [isLoading, setisLoading] = useState(false);
    const [isStartInvalid, setIsStartInvalid] = useState(false);
    const [sDate, setsDate] = useState(new Date());
    const [eDate, seteDate] = useState(new Date());

    function validateStart(val) {
        if (!val) return "Required"
        if (val.getDay() != 0) return "Timesheet must start on a Sunday"
    }
    async function handleSubmit() {

        if (validateStart(sDate)) {
            setIsStartInvalid(true)
        } else {
            setisLoading(true)
            setIsStartInvalid(false)
            const dates = getDatesInRange(sDate, eDate)

            const payload = {
                id: dates[0],
                dates:dates
            }

            await writeTimesheetData(payload)
            setisLoading(false)
            props.onclose()
        }
    }

    function getDatesInRange(startDate, endDate) {
        const date = new Date(startDate.getTime());
        const dates = [];
        while (date <= endDate) {
            const [tempDate] = new Date(date).toISOString().split('T');
            dates.push(tempDate);
            date.setDate(date.getDate() + 1);
        }
        return dates;
    }


    useEffect(() => {
        var tempDate = new Date(sDate.getTime());
        tempDate.setDate(sDate.getDate() + 13);

        seteDate(tempDate)

        console.log(sDate)
        console.log(tempDate)

        if (validateStart(sDate)) {
            setIsStartInvalid(true)
        } else {
            setIsStartInvalid(false)
        }
    }, [sDate]);

    return (
        <Formik
            initialValues={{
                start: '',
                end: '',
                id: props.id,
                notes: ''
            }}

            onSubmit={(values) => {
                handleSubmit(values)
            }}
        >

            <Form>
                <FormControl isInvalid={isStartInvalid}>
                    <FormLabel>Start Date</FormLabel>
                    <SingleDatepicker
                        name="date-input"
                        date={sDate}
                        onDateChange={setsDate}
                    />

                    <FormLabel>End Date</FormLabel>
                    <SingleDatepicker
                        disabled={true}
                        name="date-input"
                        date={eDate}
                        onDateChange={seteDate}
                    />

                    {!isStartInvalid ? (
                        <FormHelperText>
                            Timesheet Range is from {sDate.toDateString()} to {eDate.toDateString()}
                        </FormHelperText>
                    ) : (
                        <FormErrorMessage>{validateStart(sDate)}</FormErrorMessage>
                    )}
                </FormControl>
                <Center>
                    <Button
                        m={5}
                        type='submit'
                        isLoading={isLoading}
                        loadingText='Creating User'
                        colorScheme='teal'
                        variant='outline'
                    >
                        Create Timesheet
                    </Button>
                </Center>
            </Form>
        </Formik>
    )
}