import * as React from 'react'

import { Text } from 'ink'

// @ts-ignore
import Spinner from 'ink-spinner'

const mintGreen = '#98c379'

export const Mint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text color={mintGreen} children={children} />
)

export const MintSpinner: React.FC = () => (
  <Mint>
    <Spinner />
  </Mint>
)
