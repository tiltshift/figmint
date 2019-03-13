import * as React from 'react'

import { Text, Box, Color } from 'ink'

import packageJson from '../package.json'

import { Mint, MintSpinner } from './Mint'

export type HeaderProps = {
  loading?: boolean
  watching?: boolean
  fileName?: string
}

const LoadingLine: React.FC<{ text: string }> = ({ text }) => (
  <Box marginLeft={1}>
    <MintSpinner />
    <Color gray> {text}</Color>
  </Box>
)

export const Header: React.FC<HeaderProps> = ({
  loading,
  watching,
  fileName,
}) => (
  <Box flexDirection="row" justifyContent="space-between">
    <Color reset>
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
    </Color>
    <Color gray>v{packageJson.version}</Color>
  </Box>
)
