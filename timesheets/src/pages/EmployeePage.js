import React, { useState, useEffect } from 'react'

import {
    Center, HStack, Flex, Text, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    SimpleGrid
} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'

import TimesheetEditForm from '../components/employee/TimesheetEditForm';

import { addEmployeeToTimesheetifNotExists, getTimesheetData } from '../functions/FirebaseFunctions';

export default function EmployeePage(props) {
    const [timesheet, setTimesheet] = useState([]);
    const [tempTimesheet, settempTimesheet] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [cTS, setcTS] = useState("");

    async function getEmployeeTimesheet() {
        let cTS = await addEmployeeToTimesheetifNotExists(props.eID)
        let data = await getTimesheetData(cTS)
        setcTS(cTS)
        setTimesheet(data)
    }
    
    useEffect(() => {
        getEmployeeTimesheet()
    }, []);



    function getPrettyDate(date) {
        let d = new Date(date)
        var options = { year: 'numeric', month: 'long', day: 'numeric' };

        // return d.toLocaleDateString("en-US", options)
        return d.toUTCString("en-US", options).slice(5, 16)
    }

    function handleLogHours(timesheet, idx) {
        timesheet.idx = idx
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
                <HStack w="100%" display={'flex'}>
                    <Center flex={'1'} display={'flex'} justifyContent={'flex-start'} mr={'auto'} p='25'>
                        <Button onClick={() => props.navigatePage(0)}
                            leftIcon={<ArrowBackIcon />}
                            variant='outline'
                            colorScheme='blue'>Home</Button>
                    </Center>
                    <Center justifyContent={'center'} display={'flex'} flex={'1'}>
                        <Text p='25' fontSize='xl'>Select a Date</Text>
                    </Center>
                    <Center justifyContent={'center'} display={'flex'} flex={'1'} ml={'auto'} p='25'></Center>
                </HStack>

                <SimpleGrid bg='blue.500' columns={7} p={25} spacing={10}>
                    <Button w='100%' h='50' variant='solid' colorScheme='blue'>Sunday</Button>
                    <Button w='100%' h='50' variant='solid' colorScheme='blue'>Monday</Button>
                    <Button w='100%' h='50' variant='solid' colorScheme='blue'>Tuesday</Button>
                    <Button w='100%' h='50' variant='solid' colorScheme='blue'>Wednesday</Button>
                    <Button w='100%' h='50' variant='solid' colorScheme='blue'>Thursday</Button>
                    <Button w='100%' h='50' variant='solid' colorScheme='blue'>Friday</Button>
                    <Button w='100%' h='50' variant='solid' colorScheme='blue'>Saturday</Button>
                </SimpleGrid>
                {/* <Spacer /> */}
                <SimpleGrid h='100%' columns={7}>
                    {timesheet.map(function (ts, idx) {
                        return (
                            <Button
                                onClick={() => (handleLogHours(ts, idx))}
                                whiteSpace={"normal"}
                                w='100%'
                                h='100%'
                                colorScheme='blue'
                                variant={'outline'}
                                borderRadius={'0'}
                                borderBottom={'0'}
                            >
                                <Text>
                                    {getPrettyDate(ts.date)}
                                </Text>
                            </Button>
                        )
                    })}
                </SimpleGrid>
            </Flex>
        </>
    )
}
