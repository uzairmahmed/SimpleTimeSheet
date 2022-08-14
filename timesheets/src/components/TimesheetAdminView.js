import { Box, Button, Center, HStack, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import paddings from '../styles/styles'

export default function TimesheetAdminView(props) {
    return (
<VStack>
  <Center w='100%' h='40px' bg='yellow.200'>
    <HStack>
    <Center p='25' bg='green'>
    <Button colorScheme='blue'>Previous Timesheet</Button>
    </Center>
    <Center p='25' bg='red'>Current Timesheet</Center>
    <Center p='25' bg='blue'>
    <Button colorScheme='blue'>Next Timesheet</Button>
    </Center>
    </HStack>
  </Center>
  <Center w='100%' h='40px' bg='tomato'>
    2
  </Center>
</VStack>
    )
}