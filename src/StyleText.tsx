import * as React from 'react'
import * as Figma from 'figma-js'

import { Text, Box, Color } from 'ink'

import { FigmintStyle, FigmintTypeStyleType } from './utils'

import { StyleBase } from './StyleBase'

export const StyleText: React.FC<{
  text: FigmintStyle<FigmintTypeStyleType>
}> = ({ text }) => (
  <StyleBase name={text.name}>
    <Box flexDirection="row">
      <Color blue>
        <Text bold>{text.styles.fontFamily}</Text> {text.styles.fontSize}pt/
        {+(text.styles.lineHeightPx / text.styles.fontSize).toFixed(2)}em,{' '}
        {text.styles.fontWeight} weight
      </Color>
    </Box>
  </StyleBase>
)
