import * as React from 'react'

import { Box, Color } from 'ink'

import { Header, HeaderProps } from './Header'

export const Frame: React.FC<HeaderProps> = ({
  children,

  ...props
}) => (
  <Box flexDirection="column" margin={1}>
    <Header {...props} />
    {!props.loading && (
      <Color reset>
        <Box flexDirection="column" marginX={3} marginY={1}>
          {children}
        </Box>
      </Color>
    )}
  </Box>
)
