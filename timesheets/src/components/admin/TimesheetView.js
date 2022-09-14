import {
  Button, Center, HStack, VStack,
  Menu, MenuButton, MenuList, MenuItem, MenuItemOption, MenuGroup, MenuOptionGroup, MenuDivider,
  Select,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import React, { useState, useEffect } from 'react'
import { CSVLink, CSVDownload } from "react-csv";

import TimesheetAdminChart from './TimesheetChart'

import { getTimesheetData, getTimesheets, writeCurrentTimesheet, getCurrentTimesheet } from '../../firebase/Functions';
import { exportPayrollSheet, exportTimeSheet } from '../../firebase/ExcelFunctions';

export default function TimesheetView(props) {
  const [timesheets, setTimesheets] = useState([]);
  const [currentTS, setCurrentTS] = useState('')
  const [selectedTS, setSelectedTS] = useState('')
  const [refresh, setRefresh] = useState(0);

  const [selectedTSData, setSelectedTSData] = useState({
    rows: [],
    columns: []
  })

  const [selectedTSDataRAW, setSelectedTSDataRAW] = useState({})

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
      setSelectedTSDataRAW(tData)
      // console.log(tData)
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

    let totals = {}

    val.forEach(date => {
      var options = { year: 'numeric', month: 'long', day: 'numeric' };
      let dateText = new Date(date.date).toUTCString("en-US", options).slice(5, 16)
      let dayText = new Date(date.date).toUTCString("en-US", options).slice(0, 3)
      let temp = {};

      temp["Key0"] = dateText
      temp["Key1"] = dayText

      Object.keys(date).forEach(function (emp) {
        if (typeof date[emp] === 'object') {
          let tempLoyee = date[emp]
          let tTotal = 0
          if (tempLoyee.total) tTotal = parseFloat(tempLoyee.total)
          if (totals[tempLoyee.id]){
            totals[tempLoyee.id] = totals[tempLoyee.id] + tTotal
          } else {
            totals[tempLoyee.id] = tTotal
          }
        }
      })

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
          temp = {
            ...temp,
            ...temp2
          }
        }
      })
      // console.log(temp)

      rows.push(temp)
    });
    
    Object.keys(val[0]).forEach(function (emp, index) {
      if (val[0][emp].name) {
        columns.push({
          "id": "columnId_00." + (Math.floor(Math.random() * 1000000000)),
          "Header": val[0][emp].name,
          "eID" : emp,
          "Footer": "Total Hours: " + totals[emp],
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



    return {
      rows: rows,
      columns: columns,
      totals: totals
    }

  }

  function getTSChart() {
    return selectedTSData
  }

  function makeTimeSheetFile() {
    let header1 = []
    let header2 = []
    let empRows = []
    let footer = []

    let sDate = selectedTSDataRAW[0].date
    let eDate = selectedTSDataRAW[selectedTSDataRAW.length - 1].date

    selectedTSData.columns.forEach(function (col) {
      if (col.Footer != ''){
        header1.push(col.Header, "", "", "")
        footer.push("", "",col.Footer, selectedTSData.totals[col.eID])
      } else {
        footer.push(col.Footer)
        header1.push(col.Header)
      }
      col.columns.forEach(function (col2) {
        header2.push(col2.Header)
      })
    })

    selectedTSData.rows.forEach(function (row) {
      let tRow = Object.values(row)
      empRows.push(tRow)
    })

    let finalArr = []
    finalArr = [header1].concat([header2], empRows, [footer])

    let data = {
      sDate: sDate,
      eDate: eDate,
      body: finalArr
    }

    exportTimeSheet(data)
  }

  function makePayrollFile() {
    let headerline = ["Name", "Hours Worked", "Hourly Pay", "Remarks"]
    let otherlines = {}
    let finalArr = []

    let sDate = selectedTSDataRAW[0].date
    let eDate = selectedTSDataRAW[selectedTSDataRAW.length - 1].date

    selectedTSDataRAW.forEach(async function (day, idx) {
      Object.keys(day).forEach(function (emp) {
        if (typeof day[emp] === 'object') {
          let tempLoyee = day[emp]
          let eName = ""
          let eTotal = 0
          let ePay = 0
          let eNotes = "-"

            if (selectedTSData.totals[emp]) eTotal = selectedTSData.totals[emp]
            if (tempLoyee.name) eName = tempLoyee.name
            if (tempLoyee.notes) eNotes = tempLoyee.notes
            if (tempLoyee.pay) ePay = tempLoyee.pay
            otherlines[tempLoyee.id] = {
              name: eName,
              total: eTotal,
              pay: ePay,
              notes: eNotes
            }

        }
      })
    })

    finalArr.push(headerline)
    Object.keys(otherlines).forEach(function (emp) {
      let tArr = []
      tArr.push(otherlines[emp].name)
      tArr.push(otherlines[emp].total)
      tArr.push(otherlines[emp].pay)
      tArr.push(otherlines[emp].notes)
      finalArr.push(tArr)
    })

    let data = {
      sDate: sDate,
      eDate: eDate,
      body: finalArr
    }

    exportPayrollSheet(data)
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
          <MenuButton as={Button} p={5} pl={10} pr={10} rightIcon={<ChevronDownIcon ml="10" />}>
            Export
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => makeTimeSheetFile()}>Export Timesheet</MenuItem>
            <MenuItem onClick={() => makePayrollFile()}>Export Payroll Sheet</MenuItem>
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