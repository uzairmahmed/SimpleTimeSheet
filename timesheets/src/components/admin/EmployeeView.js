import React, { useState, useEffect } from 'react'
import {
    Box, Center, HStack, VStack, Text, IconButton,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button,
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'

import EmployeeEditForm from './EmployeeEditForm'
import EmployeeDeleteForm from './EmployeeDeleteForm'
import EmployeeCreateForm from './EmployeeCreateForm'

import { getEmployeeList } from '../../firebase/Functions';

export default function EmployeeView(props) {
    const [data, setdata] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [isOpen3, setIsOpen3] = useState(false);

    const [temployee, settemployee] = useState({
        "name": "Loading...",
        "id": 0,
        "pay": 0,
        "notes": "Loading"
    });

    useEffect(() => {
        handleEmployees()
    }, []);

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
    
    function handleCreate() {
        setIsOpen3(true)
    }

    function onClose() {
        setIsOpen(false)
        setIsOpen2(false)
        setIsOpen3(false)
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

            <Modal isOpen={isOpen3} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Employee Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <EmployeeCreateForm onclose={() => onClose()} id={data.length + 1}/>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <VStack>
                <Center w='100%'>
                    <Button
                        onClick={() => handleCreate()}
                        p={5}
                        type='submit'
                        colorScheme='teal'
                        variant='outline'
                    >
                        New
                    </Button>
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
                                            <Text fontSize='sm'>EMPLOYEE ID</Text>
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
                                                onClick={() => handleDelete(employee)}
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