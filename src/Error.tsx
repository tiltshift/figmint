import * as React from 'react'

import { Color } from 'ink'
import BorderBox from 'ink-box'

export const Error: React.FC = ({ children }) => (
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
