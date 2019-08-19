import * as React from 'react'

import { Text, Box, Color } from 'ink'

import { FigmintExportType } from './utils'

import { StyleBase } from './StyleBase'

export const StyleExport: React.FC<{
  image: Required<FigmintExportType>
}> = ({ image }) => (
  <StyleBase name={image.file.split('.')[0]}>
    <Box flexDirection="row">
      <Color blue>
        <Text bold>{image.directory.split('/')[2]}</Text>, {image.format}
      </Color>
    </Box>
  </StyleBase>
)
