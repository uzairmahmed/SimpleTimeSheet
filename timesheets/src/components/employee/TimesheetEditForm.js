
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

import { getEmployeeTimesheet, writeHoursToEmployeeTimesheet } from '../../functions/Functions';

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

    function roundTimeQuarterHour(time) {
        var timeToReturn =time
    
        timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
        timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
        timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
        return timeToReturn;
    }

    function getPrettyTime(date) {
        let d = new Date(date)
        var options = { year: 'numeric', month: 'long', day: 'numeric' };

        // return d.toLocaleDateString("en-US", options)
        return d.toString("en-US", options).slice(16,21)
    }

    async function handleSubmit(values) {
        if (validateETime(values.etime)) {
            setisEndInvalid(true)
        } else {
            setisEndInvalid(false)
            // setisLoading(true)

            if (!values.stime){
                values.stime = ""
            }
            if (!values.etime){
                values.etime = ""
            }
            if (!values.notes){
                values.notes = ""
            }


            let etimeDate = new Date()
            let stimeDate = new Date()

            
            let sh = values.stime.split(':')[0]
            let sm = values.stime.split(':')[1]
            
            let eh = values.etime.split(':')[0]
            let em = values.etime.split(':')[1]
            
            stimeDate.setHours(sh, sm)
            etimeDate.setHours(eh, em)

            stimeDate=roundTimeQuarterHour(stimeDate)
            etimeDate=roundTimeQuarterHour(etimeDate)

            values.stime = getPrettyTime(stimeDate)
            values.etime = getPrettyTime(etimeDate)

            let totalT = 0
            let breakT = 0
            let tempBreakT = 0

            
            totalT = Math.floor(((etimeDate-stimeDate)/1000)/60)/60
            
            if ((5.25<totalT)&&(totalT<5.5)){
                tempBreakT = totalT - 5.25
                
            } else if (totalT >= 5.5) {
                tempBreakT = 0.5
            }
            
            breakT = Math.round(tempBreakT * 60)
            
            totalT += tempBreakT

            totalT = totalT.toFixed(2)

            values.total = totalT
            values.break = breakT
            
            const combined = {
                ...initialData,
                ...values,
            }
            console.log(combined)

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
                notes: data.notes,
                name: data.name,
                pay: data.pay,
                id: data.id
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