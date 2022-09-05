import React, { useState, useEffect } from 'react'
import {
  Center,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableContainer,
} from '@chakra-ui/react'
import { useTable } from "react-table";

export default function TimesheetAdminChart(props) {
  const [tsRows, settsRows] = useState([
    {
      "Key0": "Loading",
      "Key1": "Loading",

    },
    {
      "Key0": "Loading",
      "Key1": "Loading",

    },
    {
      "Key0": "Loading",
      "Key1": "Loading",
    },
  ]);
  const [tsCols, settsCols] = useState([
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
    }
  ]);

  const data = React.useMemo(() => (tsRows), [tsRows]);
  const columns = React.useMemo(() => (tsCols), [tsCols]);

  useEffect(() => {
      let data = props.getTSChart()
      if (data){
        settsRows(data.rows)
        settsCols(data.columns)
      }
  }, [props.refresh]);

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
        <Table variant='striped' colorScheme='blue'>
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

