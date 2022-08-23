import * as React from 'react'

import { Text, Box } from 'ink'

import { FigmintExportType } from './utils'

import { StyleBase } from './StyleBase'

export const StyleExport: React.FC<{
  image: Required<FigmintExportType>
}> = ({ image }) => (
  <StyleBase name={image.file.split('.')[0]}>
    <Box flexDirection="row">
      <Text bold color="blue">{image.directory.split('/')[2]}</Text>, {image.format}

    </Box>
  </StyleBase>
)
