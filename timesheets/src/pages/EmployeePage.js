import React, { useState, useEffect } from 'react'

import {
    Center, HStack, Flex, Spacer, VStack, Text, Button,
    Grid, GridItem
} from '@chakra-ui/react'

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
            <Spacer />

            <HStack p={25} templateColumns='repeat(5, 1fr)' gap={6}>
                <Button w='100%' h='100' colorScheme='blue' />
                <Button w='100%' h='100' colorScheme='blue' />
                <Button w='100%' h='100' colorScheme='blue' />
                <Button w='100%' h='100' colorScheme='blue' />
                <Button w='100%' h='100' colorScheme='blue' />
                <Button w='100%' h='100' colorScheme='blue' />
                <Button w='100%' h='100' colorScheme='blue' />
            </HStack>
            <Spacer />

            <HStack w="100%" bg='black' justify={'space-between'}>
                <Center p='25' bg='green'></Center>
                <Center p='25' bg='red'></Center>
                <Center p='25' bg='blue'></Center>
            </HStack>
        </Flex>
    )
}
