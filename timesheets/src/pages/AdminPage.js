import React, { useState, useEffect } from 'react'

import {
    Center, HStack, Flex, Spacer, VStack, Text, Button,
    Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react'

import TimesheetView from '../components/admin/TimesheetView';
import EmployeeView from '../components/admin/EmployeeView';

import getEmployeeList from '../firebase/Functions';

export default function AdminPage(props) {   
    return (
        <Flex direction={'column'} h='100vh'>
            <HStack w="100%" bg='black' justify={'space-between'}>
                <Center p='25' bg='green'>
                    <Button onClick={() => props.navigatePage(0)} colorScheme='blue'>Home</Button>
                </Center>
                <Center p='25' bg='red'></Center>
                <Center p='25' bg='blue'></Center>
            </HStack>

            <Tabs>
                <TabList>
                    <Tab>Timesheets</Tab>
                    <Tab>Employees</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <TimesheetView />
                    </TabPanel>
                    <TabPanel>
                        <EmployeeView />
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
