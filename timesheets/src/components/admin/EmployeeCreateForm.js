
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Center,
    useToast
} from '@chakra-ui/react'

import { writeUserData } from '../../functions/Functions';

export default function TimesheetAdminView(props) {
    const [isLoading, setisLoading] = useState(false);
    const toast = useToast()

    function validateName(val) { if (!val) return "Required" }
    function validatePay(val) { if (!val) return "Required" }

    async function handleSubmit(values) {
        setisLoading(true)
        await writeUserData(values).then((val)=>{
            if (val){
                toast({
                    title: 'Created Employee',
                    status: 'success',
                    duration: 2500,
                    isClosable: true,
                  })
            } else {
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
        <Formik
            enableReinitialize={true}

            initialValues={{
                name: '',
                pay: '',
                id: props.id,
                notes: ''
            }}

            onSubmit={(values) => {
                handleSubmit(values)
            }}
        >

            <Form>
                <Field name='name' validate={(val) => validateName(val)}>
                    {({ field, form }) => (
                        <FormControl>
                            <FormLabel>Name</FormLabel>
                            <Input {...field} id="name" defaultValue={''} type='text' />
                        </FormControl>
                    )}
                </Field>

                <Field name='pay' validate={(val) => validatePay(val)}>
                    {({ field, form }) => (
                        <FormControl>
                            <FormLabel>Pay</FormLabel>
                            <Input {...field} id="pay" type='text' defaultValue={''} />
                        </FormControl>
                    )}
                </Field>

                <Field name='id'>
                    {({ field, form }) => (
                        <FormControl>
                            <FormLabel>Employee ID</FormLabel>
                            <Input disabled={true} {...field} id="id" defaultValue={props.id} type='text' />
                        </FormControl>
                    )}
                </Field>

                <Field name='notes'>
                    {({ field, form }) => (
                        <FormControl>
                            <FormLabel>Notes</FormLabel>
                            <Input {...field} id="notes" defaultValue={''} type='text' />
                        </FormControl>
                    )}
                </Field>
                <Center>
                    <Button
                        m={5}
                        type='submit'
                        isLoading={isLoading}
                        loadingText='Creating User'
                        colorScheme='blue'
                        variant='solid'
                    >
                        Create Employee
                    </Button>
                </Center>
            </Form>
        </Formik>
    )
}