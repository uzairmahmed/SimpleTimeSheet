
import React, { useEffect, useState } from 'react'
import { Formik, Form } from 'formik';
import {
    FormControl,
    FormLabel,
    Button,
    Center,
    FormHelperText,
    FormErrorMessage,
    useToast
} from '@chakra-ui/react'

import { SingleDatepicker } from 'chakra-dayzed-datepicker';

import { writeTimesheetData } from '../../functions/FirebaseFunctions';

export default function TimesheetAdminView(props) {
    const [isLoading, setisLoading] = useState(false);
    const [isStartInvalid, setIsStartInvalid] = useState(false);
    const [sDate, setsDate] = useState(new Date());
    const [eDate, seteDate] = useState(new Date());
    const toast = useToast()


    function validateStart(val) {
        if (!val) return "Required"
        if (val.getDay() !== 0) return "Timesheet must start on a Sunday"
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
                dates: dates
            }

            await writeTimesheetData(payload).then((val)=>{
                // console.log(val)
                // if (val){
                    toast({
                        title: 'Created Timesheet',
                        status: 'success',
                        duration: 2500,
                        isClosable: true,
                      })
                // } 
                // else {
                //     toast({
                //         title: 'Error',
                //         description: val,
                //         status: 'error',
                //         duration: 6500,
                //         isClosable: true,
                //       })
                // }
            })
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

        if (validateStart(sDate)) {
            setIsStartInvalid(true)
        } else {
            setIsStartInvalid(false)
        }
    }, [sDate]);

    return (
        <Formik
            enableReinitialize={true}

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
                        loadingText='Creating Timesheet'
                        colorScheme='blue'
                        variant='solid'
                    >
                        Create Timesheet
                    </Button>
                </Center>
            </Form>
        </Formik>
    )
}