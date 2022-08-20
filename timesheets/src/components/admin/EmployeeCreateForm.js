
import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik';
import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Center,
} from '@chakra-ui/react'

import { writeUserData } from '../../firebase/Functions';

export default function TimesheetAdminView(props) {
    const [isLoading, setisLoading] = useState(false);

    function validateName(val) { if (!val) return "Required" }
    function validatePay(val) { if (!val) return "Required" }

    async function handleSubmit(values) {
        setisLoading(true)
        await writeUserData(values)
        setisLoading(false)
        props.onclose()
    }

    return (
        <Formik
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
                        colorScheme='teal'
                        variant='outline'
                    >
                        Create Employee
                    </Button>
                </Center>
            </Form>
        </Formik>
    )
}