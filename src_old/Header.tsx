import * as React from 'react'

import { Text, Box } from 'ink'

import packageJson from '../package.json'

import { Mint, MintSpinner } from './Mint'

export type HeaderProps = {
  children?: React.ReactNode
  loading?: boolean
  watching?: boolean
  fileName?: string
}

const LoadingLine: React.FC<{ text: string }> = ({ text }) => (
  <Box marginLeft={1}>
    <MintSpinner />
    <Text color="gray">{text}</Text>
  </Box>
)

export const Header: React.FC<HeaderProps> = ({
  loading,
  watching,
  fileName,
}) => (
  <Box flexDirection="row" justifyContent="space-between">
    <Box marginRight={2}>🍃</Box>
    <Mint>
      <Text bold>Figmint</Text>
    </Mint>
    {loading ? (
      <LoadingLine text="Loading data from Figma" />
    ) : (
      watching && (
        <LoadingLine
          text={`Watching ${fileName ? `"${fileName}"` : 'Figma'}`}
        />
      )
    )}
    <Text color="gray">v{packageJson.version}</Text>
  </Box>
)
