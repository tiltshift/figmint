import * as React from 'react'
import * as Figma from 'figma-js'

import { Text, Box, Color } from 'ink'

import { FigmintStyle, FigmintTypeStyleType } from './utils'

export const StyleText: React.FC<{
  text: FigmintStyle<FigmintTypeStyleType>
}> = ({ text }) => (
  <Box flexDirection="column" marginBottom={1}>
    <Box flexDirection="row">
      <Text>{text.name}</Text>
    </Box>
    <Box flexDirection="row">
      <Color gray>
        <Text>
          <Text bold>{text.styles.fontFamily} </Text>
        </Text>
        <Text>
          @ {text.styles.fontWeight}/{text.styles.fontSize}pt
        </Text>
      </Color>
    </Box>
  </Box>
)
