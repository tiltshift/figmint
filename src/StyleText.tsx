import * as React from 'react'

import { Text, Box, Color } from 'ink'

import { FigmintTypeStyleType } from './utils'

import { StyleBase } from './StyleBase'

export const StyleText: React.FC<{
  text: FigmintTypeStyleType
}> = ({ text }) => (
  <StyleBase name={text.name}>
    <Box flexDirection="row">
      <Color blue>
        <Text bold>{text.styles.fontFamily}</Text> {text.styles.fontSize}pt/
        {+text.styles.lineHeight.toFixed(2)}em, {text.styles.fontWeight} weight
      </Color>
    </Box>
  </StyleBase>
)
