import {
  Button, Center, HStack, VStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Select,
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'

import TimesheetAdminChart from './TimesheetChart'
import TimesheetCreateForm from './TimesheetCreateForm'

import { getTimesheets, writeCurrentTimesheet, getCurrentTimesheet } from '../../firebase/Functions';

export default function TimesheetView(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [currentTS, setCurrentTS] = useState('')
  const [selectedTS, setSelectedTS] = useState('')


  useEffect(() => {
    handleTimeSheets()
  }, []);

  async function handleTimeSheets() {
    const tempTimesheets = await getTimesheets()
    const dataobject = Object.keys(tempTimesheets).map((key) => tempTimesheets[key])
    setTimesheets(dataobject)
    setCurrentTS(await getCurrentTimesheet())
    setSelectedTS(currentTS)
  }

  function handleTimesheetSelect(val) {
    setSelectedTS(val)
  }

  async function handleSet() {
    await writeCurrentTimesheet(selectedTS)
  }

  function handleCreate() {
    setIsOpen(true)
  }

  function onClose() {
    setIsOpen(false)
    handleTimeSheets()
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Timesheet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TimesheetCreateForm onclose={() => onClose()} />
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
            <Center p='25' bg='red'>Current Timesheet</Center>

            <Select
              onChange={(e) => handleTimesheetSelect(e.target.value)}
              placeholder={"Select a Timesheet to View"}>
              {timesheets.map(ts => (
                <option value={ts[0].date}>{ts[0].date}</option>
              ))}
            </Select>

            <Button
              onClick={() => handleSet()}
              p={5}
              type='submit'
              colorScheme='teal'
              variant='outline'
            >
              Set Timesheet
            </Button>
          </HStack>
        </Center>
        <Center w='100%'>
          <TimesheetAdminChart />
        </Center>
      </VStack>
    </>
  )
}