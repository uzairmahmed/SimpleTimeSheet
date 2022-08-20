import {
  Button, Center, HStack, VStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
} from '@chakra-ui/react'
import React, { useState } from 'react'

import TimesheetAdminChart from './TimesheetChart'
import TimesheetCreateForm from './TimesheetCreateForm'

export default function TimesheetView(props) {
  const [isOpen, setIsOpen] = useState(false);

  function handleCreate() {
    setIsOpen(true)
  }

  function onClose() {
    setIsOpen(false)
}

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Timesheet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TimesheetCreateForm onclose={() => onClose()}/>
            {/* <EmployeeEditForm onclose={() => onClose()} employee={temployee} /> */}
          </ModalBody>
        </ModalContent>
      </Modal>

      <VStack>
        <Button
          onClick={() => handleCreate()}
          p={5}
          type='submit'
          colorScheme='teal'
          variant='outline'
        >
          New Timesheet
        </Button>
        <Center w='100%' bg='yellow.200'>
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
        <Center w='100%'>
          <TimesheetAdminChart />
        </Center>
      </VStack>
    </>
  )
}