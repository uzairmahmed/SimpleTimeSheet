import {
  Box, Button, Center, HStack, VStack, Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react'

import {
  useTable
} from "react-table";

import React, { useState } from 'react'
import paddings from '../../styles/styles'

export default function TimesheetAdminChart(props) {
  const data = React.useMemo(() => ([
    {
      "Key0": "Julian",
      "Key1": "hhs.gov",
      "Key2": "Teal",
      "Key3": "Electric House, The",
      "Key4": "Chevrolet",
      "Key5": "DB9",
      "Key6": "Aminophylline",
      "Key7": "Pantoprazole Sodium",
      "Key8": "#053e17",
      "Key9": "Legaan, water"
    },
    {
      "Key0": "Ketti",
      "Key1": "desdev.cn",
      "Key2": "Turquoise",
      "Key3": "Liberty Heights",
      "Key4": "Ford",
      "Key5": "Montero Sport",
      "Key6": "Carvedilol",
      "Key7": "Bay Leaf",
      "Key8": "#53bb47",
      "Key9": "Admiral, indian red"
    },
    {
      "Key0": "Fallon",
      "Key1": "elegantthemes.com",
      "Key2": "Yellow",
      "Key3": "Exit to Hell",
      "Key4": "Toyota",
      "Key5": "GranSport",
      "Key6": "OCTINOXATE, PADIMATE O",
      "Key7": "Vita",
      "Key8": "#bffdfa",
      "Key9": "Brown antechinus"
    },
  ]), []);
  const columns = React.useMemo(() => (
    [
      {
        "id": "columnId_00.27448239441897093",
        "Header": "Start Date",
        "Footer": "",
        "columns": [
          {
            "id": "columnId_0_00.4200340858481082",
            "Header": "Date",
            "Footer": "",
            "accessor": "Key0"
          }
        ]
      },
      {
        "id": "columnId_00.49427072112246595",
        "Header": "End Date",
        "Footer": "",
        "columns": [
          {
            "id": "columnId_0_10.37746792551191",
            "Header": "Day",
            "Footer": "",
            "accessor": "Key1"
          }
        ]
      },
      {
        "id": "columnId_00.18196155910161682",
        "Header": "Name 1",
        "Footer": "Total",
        "columns": [
          {
            "id": "columnId_0_20.8006097687181224",
            "Header": "In",
            "Footer": "",
            "accessor": "Key2"
          },
          {
            "id": "columnId_0_20.8653883039581565",
            "Header": "Out",
            "Footer": "",
            "accessor": "Key3"
          },
          {
            "id": "columnId_0_20.5297450529824548",
            "Header": "Break",
            "Footer": "",
            "accessor": "Key4"
          },
          {
            "id": "columnId_0_20.9996184883377395",
            "Header": "Total",
            "Footer": "",
            "accessor": "Key5"
          }
        ]
      },
      {
        "id": "columnId_00.7916071055758422",
        "Header": "Name 2",
        "Footer": "Total",
        "columns": [
          {
            "id": "columnId_0_30.8437703760600028",
            "Header": "In",
            "Footer": "",
            "accessor": "Key6"
          },
          {
            "id": "columnId_0_30.8102445443140622",
            "Header": "Out",
            "Footer": "",
            "accessor": "Key7"
          },
          {
            "id": "columnId_0_30.07666480764828454",
            "Header": "Break",
            "Footer": "",
            "accessor": "Key8"
          },
          {
            "id": "columnId_0_30.055637219429985674",
            "Header": "Total",
            "Footer": "",
            "accessor": "Key9"
          }
        ]
      }
    ]
  ), []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,

  } = useTable({ columns, data, },
    );

  return (
    <Center w='100%'>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            {headerGroups.map((group) => (
              <Tr {...group.getHeaderGroupProps()}>
                {group.headers.map((column) => (
                  <Th {...column.getHeaderProps()}>

                    {column.render("Header")}


                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>

          <Tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <Td {...cell.getCellProps()}>{cell.render("Cell")}</Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>

          <Tfoot>
            {footerGroups.map((group) => (
              <Tr {...group.getFooterGroupProps()}>
                {group.headers.map((column) => (
                  <Td {...column.getFooterProps()}>
                    {column.render("Footer")}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tfoot>
        </Table>
      </TableContainer>
    </Center>
  )
}

