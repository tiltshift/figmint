import * as React from 'react'

import { Text, Box, Color } from 'ink'
// @ts-ignore
import Gradient from 'ink-gradient'
import tinycolor from 'tinycolor2'

import { FigmintFillStyleType } from './utils'

import { StyleBase } from './StyleBase'

const Preview: React.FC = () => (
  <Box marginRight={1}>
    <Text>██████████████████</Text>
  </Box>
)

export const StyleFill: React.FC<{
  fill: FigmintFillStyleType
}> = ({ fill }) => (
  <StyleBase name={fill.name}>
    <Box flexDirection="column">
      {fill.styles.map((style, index) => {
        switch (style.type) {
          case 'IMAGE':
            return (
              <Color gray key={index}>
                <Text>
                  🖼{'  '}
                  {style.fileName.split('.')[1]} image
                </Text>
              </Color>
            )
          case 'SOLID':
            return (
              <Color key={index} hex={tinycolor(style.color).toHex()}>
                <Preview />
              </Color>
            )
          case 'GRADIENT_LINEAR':
            return (
              <Gradient
                key={index}
                colors={style.stops.map((stop) => ({
                  color: stop.color,
                  pos: stop.y,
                }))}
              >
                <Preview />
              </Gradient>
            )
          case 'GRADIENT_RADIAL':
          case 'GRADIENT_ANGULAR':
          case 'GRADIENT_DIAMOND':
            return (
              <Gradient
                key={index}
                colors={style.stops.map((stop) => stop.color)}
              >
                <Preview />
              </Gradient>
            )
          default:
            return <Text key={index}>unknown type.</Text>
        }
      })}
    </Box>
  </StyleBase>
)
