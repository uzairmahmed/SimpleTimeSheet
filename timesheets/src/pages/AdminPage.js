import React, { useState, useEffect } from 'react'

import {
    Center, HStack, Flex, Text, Button,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
    Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react'
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons'

import { getEmployeeList } from '../functions/FirebaseFunctions';

import TimesheetView from '../components/admin/TimesheetView';
import EmployeeView from '../components/admin/EmployeeView';

import TimesheetCreateForm from '../components/admin/TimesheetCreateForm'
import EmployeeCreateForm from '../components/admin/EmployeeCreateForm'

export default function AdminPage(props) {
    const [tabIndex, setTabIndex] = React.useState(0)
    const [empData, setEmpData] = useState([]);
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);
    const [refresh1, setRefresh1] = useState(0);
    const [refresh2, setRefresh2] = useState(0);
    

    useEffect(() => {
        handleEmployees()
    }, []);

    function renderAddButton() {
        if (tabIndex === 0) {
            return (
                <Button onClick={() => handleCreate1()}
                    rightIcon={<AddIcon />}
                    variant='outline'
                    colorScheme='blue'>New Timesheet</Button>
            )
        } else if (tabIndex === 1) {
            return (

                <Button onClick={() => handleCreate2()}
                    rightIcon={<AddIcon />}
                    variant='outline'
                    colorScheme='blue'>New Employee</Button>
            )
        }
    }
    
    async function handleEmployees() {
        const tempEmployees = await getEmployeeList()
        const dataobject = Object.keys(tempEmployees).map((key) => tempEmployees[key])
        setEmpData(dataobject)
    }

    function handleCreate1() {
        setIsOpen1(true)
    }
    function onClose1() {
        setIsOpen1(false)
        setRefresh1(refresh1+1)
    }

    function handleCreate2() {
        setIsOpen2(true)
    }
    function onClose2() {
        setIsOpen2(false)
        setRefresh2(refresh2+1)
    }

    return (
        <>
            <Modal isOpen={isOpen1} onClose={onClose1}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>New Timesheet</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <TimesheetCreateForm onclose={() => onClose1()} />
                    </ModalBody>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpen2} onClose={onClose2}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>New Employee</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <EmployeeCreateForm onclose={() => onClose2()} id={empData.length + 1}/>
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
                        <Text p='25' fontSize='xl'>Admin Settings</Text>
                    </Center>
                    <Center display={'flex'} justifyContent={'flex-end'} flex={'1'} ml={'auto'} p='25'>
                        {renderAddButton()}
                    </Center>
                </HStack>

                <Tabs colorScheme='blue' isFitted onChange={(index) => setTabIndex(index)} px={25} variant='soft-rounded' >
                    <TabList>
                        <Tab>Timesheets</Tab>
                        <Tab>Employees</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <TimesheetView refresh={refresh1}/>
                        </TabPanel>
                        <TabPanel>
                            <EmployeeView refresh={refresh2}/>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Flex>
        </>
    )
}
