import * as React from 'react'

import { Text, Box, Color } from 'ink'
import tinycolor from 'tinycolor2'

export const Fill: React.FC<{
  fill: { name: string; styles: [{ color: string }] }
}> = ({ fill }) => (
  <Box flexDirection="column" marginLeft={2} marginRight={1}>
    <Text>{fill.name}</Text>
    <Box marginBottom={1} flexDirection="row">
      {fill.styles.map((style, index) => (
        <Box key={index} marginRight={1}>
          <Color hex={tinycolor(style.color).toHex()}>{'■'}</Color>
        </Box>
      ))}
    </Box>
  </Box>
)
