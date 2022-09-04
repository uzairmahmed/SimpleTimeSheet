import {
  Button, Center, HStack, VStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Select,
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'

import TimesheetAdminChart from './TimesheetChart'
import TimesheetCreateForm from './TimesheetCreateForm'

import { getTimesheetData, getTimesheets, writeCurrentTimesheet, getCurrentTimesheet } from '../../firebase/Functions';

export default function TimesheetView(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [currentTS, setCurrentTS] = useState('')
  const [selectedTS, setSelectedTS] = useState('')
  const [refresh, setRefresh] = useState(0);

  const [selectedTSData, setSelectedTSData] = useState({
    rows: [],
    columns: []
  })

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


  async function handleTimesheetSelect(val) {
    setSelectedTS(val)
    const tsV = await getTimeSheetValues(val)
    setSelectedTSData(tsV)
    setRefresh(refresh+1)
  }

  async function handleSet() {
    await writeCurrentTimesheet(selectedTS)
  }

  async function getTimeSheetValues(val) {
    if (val) {
      let tData = await getTimesheetData(val)
      return processTimesheet(tData)
    }
  }

  function processTimesheet(val) {
    let columns = [
      {
        "id": "columnId_00."+(Math.floor(Math.random() * 1000000000)),
        "Header": val[0].date,
        "Footer": "",
        "columns": [
          {
            "id": "columnId_0_00."+(Math.floor(Math.random() * 1000000000)),
            "Header": "Date",
            "Footer": "",
            "accessor": "Key0"
          }
        ]
      }, {
        "id": "columnId_00."+(Math.floor(Math.random() * 1000000000)),
        "Header": val[13].date,
        "Footer": "",
        "columns": [
          {
            "id": "columnId_0_10."+(Math.floor(Math.random() * 1000000000)),
            "Header": "Day",
            "Footer": "",
            "accessor": "Key1"
          }
        ]
      },
    ]

    let rows = []

    Object.keys(val[0]).forEach(function (emp, index) {
      if (val[0][emp].name) {
        columns.push({
          "id": "columnId_00."+(Math.floor(Math.random() * 1000000000)),
          "Header": val[0][emp].name,
          "Footer": "Total",
          "columns": [
            {
              "id": "columnId_0_20."+(Math.floor(Math.random() * 1000000000)),
              "Header": "In",
              "Footer": "",
              "accessor": val[0][emp].name + "_In"
            },
            {
              "id": "columnId_0_20."+(Math.floor(Math.random() * 1000000000)),
              "Header": "Out",
              "Footer": "",
              "accessor": val[0][emp].name + "_Out"
            },
            {
              "id": "columnId_0_20."+(Math.floor(Math.random() * 1000000000)),
              "Header": "Break",
              "Footer": "",
              "accessor": val[0][emp].name + "_Break"
            },
            {
              "id": "columnId_0_20."+(Math.floor(Math.random() * 1000000000)),
              "Header": "Total",
              "Footer": "",
              "accessor": val[0][emp].name + "_Total"
            }
          ]
        })
      }
    })

    val.forEach(date => {
      var options = { year: 'numeric', month: 'long', day: 'numeric' };
      let dateText = new Date(date.date).toUTCString("en-US", options).slice(5, 16)
      let dayText = new Date(date.date).toUTCString("en-US", options).slice(0, 3)
      let temp = {};

      temp["Key0"] = dateText
      temp["Key1"] = dayText


      Object.keys(val[0]).forEach(function (emp, index) {
        if (val[0][emp].name) {
          let IN = val[0][emp].name + "_In"
          let OUT = val[0][emp].name + "_Out"
          let BREAK = val[0][emp].name + "_Break"
          let TOTAL = val[0][emp].name + "_Total"

          let stime
          let etime
          let notes

          if (date[emp].stime) {
            stime = date[emp].stime
          } else {
            stime = "-"
          }

          if (date[emp].etime) {
            etime = date[emp].etime
          } else {
            etime = "-"
          }

          if (date[emp].notes) {
            notes = date[emp].notes
          } else {
            notes = "-"
          }

          let temp2 = {}

          temp2[IN] = stime
          temp2[OUT] = etime
          temp2[BREAK] = "99"
          temp2[TOTAL] = "99"

          temp = {
            ...temp,
            ...temp2
          }
        }
      })


      rows.push(temp)
    });

    return {
      rows: rows,
      columns: columns
    }
  }

  function getTSChart() {
    return selectedTSData
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
          <TimesheetAdminChart getTSChart={() => getTSChart()} refresh={refresh} />
        </Center>
      </VStack>
    </>
  )
}