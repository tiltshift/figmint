import * as React from 'react'

import { Text, Box, Color } from 'ink'
import Gradient from 'ink-gradient'
import tinycolor from 'tinycolor2'

import { FigmintStyle, FigmintFillStyleType } from './utils'

const Preview: React.FC = () => (
  <Box marginRight={1}>
    <Text>████████████████████</Text>
  </Box>
)

export const StyleFill: React.FC<{
  fill: FigmintStyle<FigmintFillStyleType>
}> = ({ fill }) => (
  <Box flexDirection="column" marginLeft={2} marginRight={1}>
    <Text>{fill.name}</Text>
    <Box marginBottom={1} flexDirection="column">
      {fill.styles.map((style, index) => {
        switch (style.type) {
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
        }
      })}
    </Box>
  </Box>
)
