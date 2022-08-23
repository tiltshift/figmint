import * as React from 'react'

import { Text, Box } from 'ink'
// @ts-ignore
import Gradient from 'ink-gradient'
import tinycolor from 'tinycolor2'

import { FigmintFillStyleType } from './utils'

import { StyleBase } from './StyleBase'

const Preview: React.FC<{ color?: React.ComponentProps<typeof Text>['color'] }> = ({ color }) => (
  <Box marginRight={1}>
    <Text color={color}>██████████████████</Text>
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
              <Text color="gray" key={index}>
                🖼{'  '}
                {style.fileName.split('.')[1]} image
              </Text>
            )
          case 'SOLID':
            return (
              <Preview color={tinycolor(style.color).toHex()} key={index} />
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
  </StyleBase >
)
