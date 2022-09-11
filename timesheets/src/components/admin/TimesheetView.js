import {
  Button, Center, HStack, VStack,
  Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider,
  Select,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import React, { useState, useEffect } from 'react'

import TimesheetAdminChart from './TimesheetChart'

import { getTimesheetData, getTimesheets, writeCurrentTimesheet, getCurrentTimesheet } from '../../firebase/Functions';

export default function TimesheetView(props) {
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
  }, [props.refresh]);

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
    setRefresh(refresh + 1)
  }

  async function handleSet() {
    await writeCurrentTimesheet(selectedTS)
  }

  async function getTimeSheetValues(val) {
    if (val) {
      let tData = await getTimesheetData(val)
      console.log(tData)
      return processTimesheet(tData)
    }
  }

  function processTimesheet(val) {
    let columns = [
      {
        "id": "columnId_00." + (Math.floor(Math.random() * 1000000000)),
        "Header": val[0].date,
        "Footer": "",
        "columns": [
          {
            "id": "columnId_0_00." + (Math.floor(Math.random() * 1000000000)),
            "Header": "Date",
            "Footer": "",
            "accessor": "Key0"
          }
        ]
      }, {
        "id": "columnId_00." + (Math.floor(Math.random() * 1000000000)),
        "Header": val[13].date,
        "Footer": "",
        "columns": [
          {
            "id": "columnId_0_10." + (Math.floor(Math.random() * 1000000000)),
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
          "id": "columnId_00." + (Math.floor(Math.random() * 1000000000)),
          "Header": val[0][emp].name,
          "Footer": "Total",
          "columns": [
            {
              "id": "columnId_0_20." + (Math.floor(Math.random() * 1000000000)),
              "Header": "In",
              "Footer": "",
              "accessor": val[0][emp].name + "_In"
            },
            {
              "id": "columnId_0_20." + (Math.floor(Math.random() * 1000000000)),
              "Header": "Out",
              "Footer": "",
              "accessor": val[0][emp].name + "_Out"
            },
            {
              "id": "columnId_0_20." + (Math.floor(Math.random() * 1000000000)),
              "Header": "Break",
              "Footer": "",
              "accessor": val[0][emp].name + "_Break"
            },
            {
              "id": "columnId_0_20." + (Math.floor(Math.random() * 1000000000)),
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

      console.log(val[0])
      Object.keys(val[0]).forEach(function (emp, index) {
        if (val[0][emp].name) {
          let IN = val[0][emp].name + "_In"
          let OUT = val[0][emp].name + "_Out"
          let BREAK = val[0][emp].name + "_Break"
          let TOTAL = val[0][emp].name + "_Total"

          let stime
          let etime
          let notes
          let breakT
          let totalT

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

          if (date[emp].break) {
            breakT = date[emp].break
          } else {
            breakT = "-"
          }

          if (date[emp].total) {
            totalT = date[emp].total
          } else {
            totalT = "-"
          }

          let temp2 = {}

          temp2[IN] = stime
          temp2[OUT] = etime
          temp2[BREAK] = breakT
          temp2[TOTAL] = totalT
          console.log(temp2)
          temp = {
            ...temp,
            ...temp2
          }
        }
      })
      // console.log(temp)
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


  return (
    <VStack>
      <HStack w='100%'>
        <Select
          variant='filled'
          onChange={(e) => handleTimesheetSelect(e.target.value)}
          placeholder={"Select a Timesheet to View"}>
          {timesheets.map(ts => (
            <option value={ts[0].date}>{ts[0].date}</option>
          ))}
        </Select>

        <Button
          onClick={() => handleSet()}
          p={5}
          pl={10}
          pr={10}
          type='submit'
          colorScheme='blue'
          variant='solid'
        >
          Activate Timesheet
        </Button>

        <Menu>
          <MenuButton as={Button} p={5} pl={10} pr={10} rightIcon={<ChevronDownIcon ml="10"/>}>
            Export
          </MenuButton>
          <MenuList>
            <MenuItem>Export Timesheet</MenuItem>
            <MenuItem>Export Payroll Sheet</MenuItem>
            <MenuItem>Export Email</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <Center w='100%'>
        <TimesheetAdminChart getTSChart={() => getTSChart()} refresh={refresh} />
      </Center>
    </VStack>
  )
}