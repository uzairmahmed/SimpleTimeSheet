import React, { useState, useEffect } from 'react'

import {
    Center, HStack, Flex, Spacer, VStack, Text, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    SimpleGrid
} from '@chakra-ui/react'

import TimesheetEditForm from '../components/employee/TimesheetEditForm';

import { addEmployeeToTimesheetifNotExists, getTimesheetData } from '../firebase/Functions';

export default function EmployeePage(props) {
    const [timesheet, setTimesheet] = useState([]);
    const [tempTimesheet, settempTimesheet] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [cTS, setcTS] = useState("");


    useEffect(() => {
        getEmployeeTimesheet()
    }, []);

    async function getEmployeeTimesheet() {
        let cTS = await addEmployeeToTimesheetifNotExists(props.eID)
        let data = await getTimesheetData(cTS)
        setcTS(cTS)
        setTimesheet(data)
    }

    function getPrettyDate(date) {
        let d = new Date(date)
        var options = { year: 'numeric', month: 'long', day: 'numeric' };

        // return d.toLocaleDateString("en-US", options)
        return d.toUTCString("en-US", options).slice(5, 16)
    }

    function handleLogHours(timesheet, idx) {
        timesheet.idx = idx
        // console.log(timesheet)
        settempTimesheet(timesheet)
        setIsOpen(true)
    }

    function onClose() {
        setIsOpen(false)
        getEmployeeTimesheet()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Times for {getPrettyDate(tempTimesheet.date)}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <TimesheetEditForm cTS={cTS} eID={props.eID} timesheet={tempTimesheet} onclose={() => onClose()} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Flex direction={'column'} h='100vh'>
                <HStack w="100%" bg='black' justify={'space-between'}>
                    <Center p='25' bg='green'>
                        <Button onClick={() => props.navigatePage(0)} colorScheme='blue'>Home</Button>
                    </Center>
                    <Center p='25' bg='red'></Center>
                    <Center p='25' bg='blue'></Center>
                </HStack>
                <Spacer />

                <SimpleGrid columns={7} p={25} spacing={10}>
                    <Button w='100%' h='100' colorScheme='blue'>Sunday</Button>
                    <Button w='100%' h='100' colorScheme='blue'>Monday</Button>
                    <Button w='100%' h='100' colorScheme='blue'>Tuesday</Button>
                    <Button w='100%' h='100' colorScheme='blue'>Wednesday</Button>
                    <Button w='100%' h='100' colorScheme='blue'>Thursday</Button>
                    <Button w='100%' h='100' colorScheme='blue'>Friday</Button>
                    <Button w='100%' h='100' colorScheme='blue'>Saturday</Button>
                    {timesheet.map(function (ts, idx) {
                        return (
                            <Button
                                onClick={() => (handleLogHours(ts, idx))}
                                whiteSpace={"normal"}
                                w='100%'
                                h='100'
                                colorScheme='blue'>
                                <Text>
                                    {getPrettyDate(ts.date)}
                                </Text>
                            </Button>
                        )
                    })}
                </SimpleGrid>
                <Spacer />

                <HStack w="100%" bg='black' justify={'space-between'}>
                    <Center p='25' bg='green'></Center>
                    <Center p='25' bg='red'></Center>
                    <Center p='25' bg='blue'></Center>
                </HStack>
            </Flex>
        </>
    )
}
