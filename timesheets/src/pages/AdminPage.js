import React, { useState, useEffect } from 'react'

import { Center, SimpleGrid, HStack, Flex, Spacer, VStack, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

import UserCard from '../components/UserCard';

import paddings from '../styles/styles';

import getEmployeeList from '../firebase/Functions';
import TimesheetAdminView from '../components/TimesheetAdminView';

export default function UserPage(props) {
    const [employees, setEmployees] = useState([]);

    async function handleEmployees() {
        // const tempEmployees = await getEmployeeList()
        // console.log(tempEmployees)
        // setEmployees(tempEmployees)
    }

    useEffect(() => {
        handleEmployees()
    }, []);

    return (
        <Flex direction={'column'} h='100vh'>
            <HStack w="100%" bg='black' justify={'space-between'}>
                <Center p='25' bg='green'>
                    <Button onClick={() => props.navigatePage(0)} colorScheme='blue'>Home</Button>
                </Center>
                <Center p='25' bg='red'></Center>
                <Center p='25' bg='blue'></Center>
            </HStack>
            <Spacer />

            <Tabs>
                <TabList>
                    <Tab>Timesheets</Tab>
                    <Tab>Employees</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <TimesheetAdminView />
                    </TabPanel>
                    <TabPanel>
                    <p>List all Employees Here</p>
                    </TabPanel>
                </TabPanels>
                </Tabs>
            <Spacer />

            <HStack w="100%" bg='black' justify={'space-between'}>
                <Center p='25' bg='green'></Center>
                <Center p='25' bg='red'></Center>
                <Center p='25' bg='blue'></Center>
            </HStack>
        </Flex>
    )
}
