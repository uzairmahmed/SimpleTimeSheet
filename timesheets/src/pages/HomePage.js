import React, { useState, useEffect } from 'react'

import {
    Center, SimpleGrid, HStack, Flex, Spacer, Text, Button, Image, Input, InputGroup, InputRightElement,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useDisclosure,
    useToast,
} from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'

import UserCard from '../components/UserCard';

import paddings from '../styles/styles';
import { getEmployeeList, getCurrentTimesheet } from '../functions/FirebaseFunctions';

export default function UserPage(props) {
    const [employees, setEmployees] = useState([]);
    const [tsTimes, settsTimes] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)
    const [pValue, setPValue] = React.useState('')
    const handleChange = (event) => setPValue(event.target.value)
    const toast = useToast()


    async function handleEmployees() {
        const tempEmployees = await getEmployeeList()
        const dataobject = Object.keys(tempEmployees).map((key) => tempEmployees[key])
        setEmployees(dataobject)
    }

    async function getCurrentTimesheetValues() {
        let ts = await getCurrentTimesheet()
        let tsS = new Date(ts)
        let tsE = new Date(tsS.getTime())

        var options = { year: 'numeric', month: 'long', day: 'numeric' };

        tsE.setDate(tsS.getDate() + 13)

        settsTimes([tsS.toUTCString("en-US", options).slice(5, 16), tsE.toUTCString("en-US", options).slice(5, 16)])
    }

    function handlePassword() {
        if (pValue === 'Uzair786') {
            console.log('allowed')
            props.navigatePage(1)
        } else {
            console.log('nope')
            toast({
                title: 'Incorrect Password',
                description: "Please Try Again.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            })

        }
    }

    useEffect(() => {
        handleEmployees()
        getCurrentTimesheetValues()
    }, []);

    return (
        <Flex direction={'column'} h='100vh'>
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                            Login to Admin
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <InputGroup size='md'>
                                <Input
                                    pr='4.5rem'
                                    type={show ? 'text' : 'password'}
                                    placeholder='Enter password'
                                    onChange={handleChange}
                                />
                                <InputRightElement width='4.5rem'>
                                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                                        {show ? 'Hide' : 'Show'}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Cancel
                            </Button>
                            <Button colorScheme='red' onClick={handlePassword} ml={3}>
                                Login
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <HStack w="100%" display={'flex'}>
                <Center flex={'1'} display={'flex'} justifyContent={'flex-start'} mr={'auto'} p='25'>
                    <Image src='https://i.gyazo.com/d74f92946aa2ebf071b955c824a1b64c.png' w='200px' alt='Logo' />
                </Center>
                <Center justifyContent={'center'} display={'flex'} flex={'1'}>
                    <Text p='25' fontSize='xl'>{tsTimes[0]} to {tsTimes[1]}</Text>
                </Center>
                <Center display={'flex'} justifyContent={'flex-end'} flex={'1'} ml={'auto'} p='25'>
                    <Button
                        rightIcon={<SettingsIcon />}
                        variant='outline'
                        colorScheme='blue'
                        // onClick={() => props.navigatePage(1)}>
                        onClick={onOpen}>
                        Admin
                    </Button>
                </Center>
            </HStack>

            <Spacer />

            {/* <Center py="25px"><Text>Select User to Log Hours</Text></Center> */}
            <SimpleGrid px={paddings.userPadX} minChildWidth={paddings.userButton} spacing='40px'>
                {employees.map(emp => (
                    <UserCard navigatePage={props.navigatePage} id={emp.id} name={emp.name} />
                ))}
            </SimpleGrid>

            <Spacer />

            <HStack w="100%" display={'flex'}>
                <Center flex={'1'} display={'flex'} justifyContent={'flex-start'} mr={'auto'} p='25'>
                </Center>
                <Center justifyContent={'center'} display={'flex'} flex={'1'}>
                    <Text p='25' fontSize='sm'>Uzair's Super Cool Timesheet Program</Text>
                </Center>
                <Center display={'flex'} justifyContent={'flex-end'} flex={'1'} ml={'auto'} p='25'>
                    <Button
                        rightIcon={<SettingsIcon />}
                        variant='outline'
                        colorScheme='blue'
                        onClick={() => props.navigatePage(3)}>
                        {/* onClick={onOpen}> */}
                        View Full Timesheet
                    </Button>
                </Center>
            </HStack>
        </Flex>
    )
}
