import * as React from 'react'

import { Text, Box } from 'ink'

export const StyleBase: React.FC<{ name: string }> = ({ name, children }) => (
  <Box flexDirection="column" marginLeft={1} marginRight={3} marginBottom={1}>
    <Text>{name}</Text>
    {children}
  </Box>
)
