import React, { useState, useEffect } from 'react'

import { Center, SimpleGrid, HStack, Flex, Spacer, VStack, Text, Button, Image } from '@chakra-ui/react'

import UserCard from '../components/UserCard';

import paddings from '../styles/styles';
import {getEmployeeList} from '../firebase/Functions';

export default function UserPage(props) {
    const [employees, setEmployees] = useState([]);

    async function handleEmployees() {
        const tempEmployees = await getEmployeeList()
        const dataobject = Object.keys(tempEmployees).map((key) => tempEmployees[key])
        setEmployees(dataobject)
    }

    useEffect(() => {
        handleEmployees()
    }, []);

    return (
        <Flex direction={'column'} h='100vh'>
            <HStack w="100%" justify={'space-between'}>
                <Image src='https://i.gyazo.com/d74f92946aa2ebf071b955c824a1b64c.png' m={25} w='250px' alt='Logo' />
                <Center p='25'></Center>
                <Center p='25'>
                    <Button onClick={() => props.navigatePage(1)} colorScheme='blue'>Admin</Button>
                </Center>
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
                    <UserCard navigatePage={props.navigatePage} id={emp.id} name={emp.name} />
                ))}
            </SimpleGrid>

            <Spacer />

            <HStack w="100%" bg='black' justify={'space-between'}>
                <Center p='25' bg='green'></Center>
                <Center p='25' bg='red'></Center>
                <Center p='25' bg='blue'>
                    <Button onClick={() => props.navigatePage(1)} colorScheme='blue'>Admin</Button>
                </Center>
            </HStack>
        </Flex>
    )
}
