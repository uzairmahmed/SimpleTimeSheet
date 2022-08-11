import { Button, Center } from '@chakra-ui/react'
import React, { useState } from 'react'
import paddings from '../styles/styles'

export default function TitleBar(props) {
    return (
       <Button borderRadius="lg" height={paddings.userButton}>
          {props.name}
       </Button>
    )
}