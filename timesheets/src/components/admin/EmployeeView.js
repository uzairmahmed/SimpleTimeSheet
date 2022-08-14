import {
    Box, Button, Center, HStack, VStack, Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Text,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'

import { EditIcon, DeleteIcon } from '@chakra-ui/icons'

import React, { useState, useEffect } from 'react'
import paddings from '../../styles/styles'

import EmployeeEditForm from './EmployeeEditForm'


export default function TimesheetAdminView(props) {
    const [data, setdata] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [temployee, settemployee] = useState({
        "name": "Loading...",
        "id": 0,
        "pay": 0,
        "notes": "Loading"
    });


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

    function handleEdit(employee) {
        console.log(employee)
        settemployee(employee)
        setIsOpen(true)
    }

    function onClose() {
        setIsOpen(false)
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <EmployeeEditForm employee={temployee} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <VStack>
                <Center w='100%'>
                    <Accordion w='100%' allowToggle>
                        {data.map((employee) => (
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box flex='1' textAlign='left'>
                                            {employee.name}
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <HStack w="100%" bg='black' justify={'space-between'}>
                                        <VStack p='25' bg='green' verticalAlign={'top'} align={'left'}>
                                            <Text fontSize='sm'>PAY</Text>
                                            <Text fontSize='sm'>${employee.pay}/hr</Text>
                                            <Text bold fontSize='sm'>EMPLOYEE ID</Text>
                                            <Text fontSize='sm'>#{employee.id}</Text>
                                        </VStack>
                                        <VStack p='25' w='100%' bg='green' align={'center'}>
                                            <Text fontSize='sm'>Notes</Text>
                                            <Text fontSize='sm'>{employee.notes}</Text>
                                        </VStack>
                                        <Center p='25' bg='blue'>
                                            <IconButton
                                                onClick={() => handleEdit(employee)}
                                                variant='outline'
                                                colorScheme='teal'
                                                aria-label='Edit Employee'
                                                fontSize='20px'
                                                icon={<EditIcon />}
                                            />
                                            <IconButton
                                                variant='outline'
                                                colorScheme='teal'
                                                aria-label='Delete Employee'
                                                fontSize='20px'
                                                icon={<DeleteIcon />}
                                            />
                                        </Center>
                                    </HStack>
                                </AccordionPanel>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </Center>
            </VStack>
        </>
    )
}