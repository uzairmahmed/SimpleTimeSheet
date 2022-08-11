import React, { useState, useEffect } from 'react'

import { Center, SimpleGrid, HStack, Flex, Spacer, VStack, Text, Button } from '@chakra-ui/react'

import UserCard from '../components/UserCard';

import paddings from '../styles/styles';

import getEmployeeList from '../firebase/Functions';

export default function UserPage(props) {
    const [employees, setEmployees] = useState([]);

    async function handleEmployees() {
        const tempEmployees = await getEmployeeList()
        console.log(tempEmployees)
        setEmployees(tempEmployees)
    }

    useEffect(() => {
        handleEmployees()
    }, []);

    return (
        <Flex direction={'column'} h='100vh'>
            <HStack w="100%" bg='black' justify={'space-between'}>
                <Center p='25' bg='green'></Center>
                <Center p='25' bg='red'></Center>
                <Center p='25' bg='blue'></Center>
            </HStack>

            <Spacer />

            <VStack>
                <Text>
                    Select User
                </Text>

                <Text>
                    Current Time Period:
                </Text>
            </VStack>

            <Spacer />

            <SimpleGrid px={paddings.userPadX} minChildWidth={paddings.userButton} spacing='40px'>
                {employees.map(emp => (
                    <UserCard name={emp.name} />
                ))}
            </SimpleGrid>

            <Spacer />

            <HStack w="100%" bg='black' justify={'space-between'}>
                <Center p='25' bg='green'></Center>
                <Center p='25' bg='red'></Center>
                <Center p='25' bg='blue'></Center>
            </HStack>
        </Flex>
    )
}
