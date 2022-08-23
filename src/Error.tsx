import * as React from 'react'

import { Text } from 'ink'

// @ts-ignore
import BorderBox from 'ink-box'

export const ErrorBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BorderBox
    borderStyle="round"
    borderColor="red"
    float="center"
    margin={1}
    padding={1}
  >
    <Text color="red">Error</Text> {children}
  </BorderBox>
)
