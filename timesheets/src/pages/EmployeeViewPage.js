import React, { useState, useEffect } from 'react'
import {Center, HStack, Flex, Text, Button, Box} from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'

import TimesheetView from '../components/admin/TimesheetView';

export default function AdminPage(props) {
    const [refresh1, setRefresh1] = useState(0);

    useEffect(() => {
    }, []);

    return (
        <>
            <Flex direction={'column'} h='100vh'>
                <HStack w="100%" display={'flex'}>
                    <Center flex={'1'} display={'flex'} justifyContent={'flex-start'} mr={'auto'} p='25'>
                        <Button onClick={() => props.navigatePage(0)}
                            leftIcon={<ArrowBackIcon />}
                            variant='outline'
                            colorScheme='blue'>Home</Button>
                    </Center>
                    <Center justifyContent={'center'} display={'flex'} flex={'1'}>
                        <Text p='25' fontSize='xl'>View Timesheet</Text>
                    </Center>
                    <Center display={'flex'} justifyContent={'flex-end'} flex={'1'} ml={'auto'} p='25'>
                    </Center>
                </HStack>

                <Box px={25}>
                    <TimesheetView activate={false} refresh={refresh1} />
                </Box>
            </Flex>
        </>
    )
}
