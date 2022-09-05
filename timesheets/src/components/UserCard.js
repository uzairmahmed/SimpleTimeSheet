import { Button, Center } from '@chakra-ui/react'
import React, { useState } from 'react'

export default function TitleBar(props) {
   return (
      <Button onClick={() => props.navigatePage(2, props.id)}
         boxShadow='base'
         borderRadius="lg"
         height='100'
         colorScheme='blue'
         variant={'outline'}
      >
         {props.name}
      </Button>
   )
}