import * as React from 'react'

import { Color } from 'ink'

// @ts-ignore
import BorderBox from 'ink-box'

export const ErrorBox: React.FC = ({ children }) => (
  <BorderBox
    borderStyle="round"
    borderColor="red"
    float="center"
    margin={1}
    padding={1}
  >
    <Color red>Error</Color> {children}
  </BorderBox>
)
