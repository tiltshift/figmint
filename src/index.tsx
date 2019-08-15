import React from 'react'
import useInterval from 'use-interval'

import * as Figma from 'figma-js'

import cosmiconfig from 'cosmiconfig'

import fs from 'fs'
import path from 'path'
import util from 'util'

import { Text, Box, Color, render } from 'ink'

import { StyleFill } from './StyleFill'
import { StyleText } from './StyleText'

import { Frame } from './Frame'
import { Error } from './Error'

import {
  getStylesFromFile,
  FigmintStyle,
  FigmintFillStyleType,
  FigmintTypeStyleType,
} from './utils'

// clear the console
process.stdout.write('\x1Bc')

const Header = ({ text }: { text: string }) => (
  <Color gray>
    <Box marginBottom={1}>
      <Text bold>{text}:</Text>
    </Box>
  </Color>
)

const Output = () => {
  // 📝 State
  // --------

  // Config
  const [token, setToken] = React.useState('')
  const [file, setFile] = React.useState('')
  const [output, setOutput] = React.useState('figmaStyles')
  const [typescript, setTypescript] = React.useState(false)

  // Data from Figma
  const [fileName, setFileName] = React.useState('')
  const [fills, setFills] = React.useState<
    FigmintStyle<FigmintFillStyleType>[]
  >([])
  const [typography, setTypography] = React.useState<
    FigmintStyle<FigmintTypeStyleType>[]
  >([])

  // Internal State
  const [loading, setLoading] = React.useState(true)
  const [hasConfig, setHasConfig] = React.useState(false)
  const [watching] = React.useState(process.argv.slice(2)[0] === 'watch')
  const [client, setClient] = React.useState<Figma.ClientInterface>()

  // 📡 Function to connect to Figma and get the data we need
  // --------------------------------------------------------

  const fetchData = React.useCallback(async () => {
    if (client && file) {
      const [fileResponse, imageFillsResponse] = await Promise.all([
        client.file(file),
        client.fileImageFills(file),
      ])

      setFileName(fileResponse.data.name)

      // Make sure the output directory exists
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true })
      }

      // combine the style meta data with the actual style info
      const styles = await getStylesFromFile(
        fileResponse.data,
        imageFillsResponse.data,
        output,
      )

      // write out our file

      let solidColors = ''

      styles.fill.forEach((fill) => {
        fill.styles.forEach((style) => {
          if (style.type === 'SOLID') {
            solidColors += `| '${style.color}'`
          }
        })
      })

      fs.writeFileSync(
        path.join(output, `index.${typescript ? 'ts' : 'js'}`),
        `
        const styles = ${util.inspect(styles, {
          depth: Infinity,
          compact: false,
        })} ${typescript ? 'as const' : ''}

        ${
          typescript
            ? `
          export type SolidColors = ${solidColors}
          export type FillNames = typeof styles.fill[number]['name']
          export type TextNames = typeof styles.text[number]['name']
          `
            : ''
        }

        export default styles`,
      )

      setLoading(false)

      // set our local state
      setFills(styles.fill)
      setTypography(styles.text)
    }
  }, [client, file, output, typescript])

  // ⚓️ Hooks!
  // ---------

  // 🛠 Initial Setup
  React.useEffect(() => {
    const explorer = cosmiconfig('figmint')

    const configResult = explorer.searchSync()

    if (configResult) {
      setHasConfig(true)

      if ('token' in configResult.config) {
        setToken(configResult.config.token)
      }

      if ('file' in configResult.config) {
        setFile(configResult.config.file)
      }

      if ('output' in configResult.config) {
        setOutput(configResult.config.output)
      }

      if ('typescript' in configResult.config) {
        setTypescript(configResult.config.typescript)
      }
    }

    if (token) {
      setClient(
        Figma.Client({
          personalAccessToken: token,
        }),
      )
    }
  }, [token, file])

  // 🐶 Initial data fetch
  React.useEffect(() => {
    const fetch = async () => {
      fetchData()
    }
    fetch()
  }, [client, fetchData])

  // 👀 if we're watching, keep fetching
  useInterval(fetchData, watching ? 1000 : null)

  // ⚠️ Error Handling
  // -----------------

  if (!hasConfig) {
    return (
      <Frame>
        <Error>
          Figmint requires a config.
          (https://github.com/tiltshift/figmint#config)
        </Error>
      </Frame>
    )
  }

  if (!client) {
    return (
      <Frame>
        <Error>
          Figma Token is required. (https://github.com/tiltshift/figmint#token)
        </Error>
      </Frame>
    )
  }

  if (!file) {
    return (
      <Frame>
        <Error>
          Figma File is required. (https://github.com/tiltshift/figmint#file)
        </Error>
      </Frame>
    )
  }

  // 🍃 The App
  // ----------

  return (
    <Frame loading={loading} watching={watching} fileName={fileName}>
      <Box flexDirection="row">
        <Box flexDirection="column">
          <Header text="Fill Styles" />
          {fills.map((fill) => (
            <StyleFill key={fill.key} fill={fill} />
          ))}
        </Box>
        <Box flexDirection="column">
          <Header text="Text Styles" />
          {typography.map((text) => (
            <StyleText key={text.key} text={text} />
          ))}
        </Box>
      </Box>
    </Frame>
  )
}

render(<Output />)
