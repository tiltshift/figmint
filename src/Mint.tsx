import * as React from 'react'

import { Color } from 'ink'
import Spinner from 'ink-spinner'

const mintGreen = '#98c379'

export const Mint: React.FC = ({ children }) => (
  <Color hex={mintGreen} children={children} />
)

export const MintSpinner: React.FC = () => (
  <Mint>
    <Spinner />
  </Mint>
)
