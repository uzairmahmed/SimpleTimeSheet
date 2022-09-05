
import React, { useState, useEffect, useRef } from 'react'
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

import { getEmployeeTimesheet, writeHoursToEmployeeTimesheet } from '../../firebase/Functions';

export default function TimesheetEditForm(props) {
    const [isLoading, setisLoading] = useState(false);
    const [data, setData] = useState({});
    const [initialData, setInitialData] = useState({})
    const [isEndInvalid, setisEndInvalid] = useState(false);
    const formRef = useRef();

    function validateETime(val) { 
        if (formRef.current.values.stime && (!(formRef.current.values.stime < val))) return "End Time must be later than Start Time!" }

    useEffect(() => {
        handleData()
        setInitialData(props.timesheet[props.eID])
    }, []);

    async function handleData() {
        let data = await getEmployeeTimesheet(props.cTS,props.timesheet.idx,props.eID)
        setData(data)
    }

    async function handleSubmit(values) {
        if (validateETime(values.etime)) {
            setisEndInvalid(true)
        } else {
            setisEndInvalid(false)
            setisLoading(true)

            if (!values.stime){
                values.stime = ""
            }
            if (!values.etime){
                values.etime = ""
            }

            const combined = {
                ...initialData,
                ...values
            }
            await writeHoursToEmployeeTimesheet(
                props.cTS,
                props.timesheet.idx,
                props.eID,
                combined
            )
            setisLoading(false)
            props.onclose()
        }
    }

    return (
        <Formik
            enableReinitialize={true}
            innerRef={formRef}
            initialValues={{
                stime: data.stime,
                etime: data.etime,
                notes: data.notes
            }}

            onSubmit={(values) => {
                handleSubmit(values)
            }}
        >
            <Form>
                <Field name='stime'>
                    {({ field, form }) => (
                        <FormControl>
                            <FormLabel>Start Time</FormLabel>
                            <Input {...field} id="stime" type='time' />
                        </FormControl>
                    )}
                </Field>

                <Field name='etime'>
                    {({ field, form }) => (
                        <FormControl isInvalid={isEndInvalid}>
                            <FormLabel>End Time</FormLabel>
                            <Input {...field} id="etime" type='time' />
                            {!isEndInvalid ? (
                                <FormHelperText></FormHelperText>
                            ) : (
                                <FormErrorMessage>End Time must be later than Start Time!</FormErrorMessage>
                            )}
                        </FormControl>
                    )}
                </Field>

                <Field name='notes'>
                    {({ field, form }) => (
                        <FormControl>
                            <FormLabel>Notes</FormLabel>
                            <Input {...field} id="notes" type='text' />
                        </FormControl>
                    )}
                </Field>

                <Center>
                    <Button
                        m={5}
                        type='submit'
                        isLoading={isLoading}
                        loadingText='Saving'
                        colorScheme='blue'
                        variant='solid'
                    >
                        Submit Hours
                    </Button>
                </Center>
            </Form>
        </Formik>
    )
}