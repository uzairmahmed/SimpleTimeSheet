import React, { useState, useEffect } from 'react'
import {
    Box, Center, HStack, VStack,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button,
    Stat, StatLabel, StatNumber, StatHelpText,
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'

import EmployeeEditForm from './EmployeeEditForm'
import EmployeeDeleteForm from './EmployeeDeleteForm'

import { getEmployeeList } from '../../functions/FirebaseFunctions';

export default function EmployeeView(props) {
    const [data, setdata] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);

    const [temployee, settemployee] = useState({
        "name": "Loading...",
        "id": 0,
        "pay": 0,
        "notes": "Loading"
    });

    useEffect(() => {
        handleEmployees()
    }, [props.refresh]);

    async function handleEmployees() {
        const tempEmployees = await getEmployeeList()
        const dataobject = Object.keys(tempEmployees).map((key) => tempEmployees[key])
        setdata(dataobject)
    }

    function handleEdit(employee) {
        settemployee(employee)
        setIsOpen(true)
    }

    function handleDelete(employee) {
        settemployee(employee)
        setIsOpen2(true)
    }

    function onClose() {
        setIsOpen(false)
        setIsOpen2(false)
        handleEmployees()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Employee Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <EmployeeEditForm onclose={() => onClose()} employee={temployee} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen2} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete {temployee.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <EmployeeDeleteForm onclose={() => onClose()} employee={temployee} />
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
                                    <HStack w="100%" justify={'space-between'}>
                                        <Stat>
                                            <StatLabel>Pay</StatLabel>
                                            <StatNumber>${employee.pay}/hr</StatNumber>
                                        </Stat>
                                        <Stat>
                                            <StatLabel>Employee ID</StatLabel>
                                            <StatNumber>#{employee.id}</StatNumber>
                                        </Stat>
                                        <Stat>
                                            <StatLabel>Employee Notes</StatLabel>
                                            <StatHelpText>{employee.notes}</StatHelpText>
                                        </Stat>
                                        <Center>
                                            <Button onClick={() => handleEdit(employee)}
                                                leftIcon={<EditIcon />}
                                                variant='outline'
                                                colorScheme='blue'>Edit Employee</Button>

                                            <Button onClick={() => handleDelete(employee)}
                                                ml='5'
                                                leftIcon={<EditIcon />}
                                                variant='outline'
                                                colorScheme='blue'>Delete Employee</Button>
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