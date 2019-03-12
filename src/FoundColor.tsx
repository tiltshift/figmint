import * as React from 'react'

import { Text, Box, Color } from 'ink'

import { StyleType } from './'

export const FoundColor: React.FC<StyleType> = ({ name, color }) => (
  <Box marginLeft={2} marginRight={1}>
    <Box marginX={1}>
      <Color rgb={[color.r * 255, color.g * 255, color.b * 255]}>{'■'}</Color>
    </Box>
    <Text>{name}</Text>
  </Box>
)
