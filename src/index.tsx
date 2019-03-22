import * as React from 'react'
import { useState, useEffect } from 'react'
import useInterval from 'use-interval'

import * as Figma from 'figma-js'

import cosmiconfig from 'cosmiconfig'

import fs from 'fs'
import path from 'path'
import util from 'util'

import { Text, Box, Color, render } from 'ink'

import { figmaToJson, RawStyleObject } from './utils'

import { StyleFill } from './StyleFill'
import { StyleText } from './StyleText'

import { Frame } from './Frame'
import { Error } from './Error'

// clear the console
process.stdout.write('\x1Bc')

const findStyleInNode = (
  keysToFind: string[],
  node: Figma.Node,
  styles = {},
): RawStyleObject => {
  if ('styles' in node) {
    Object.entries(node.styles).forEach(([styleType, key]) => {
      if (!(key in styles)) {
        styles[key] = {}

        switch (styleType) {
          case 'text':
            if ('style' in node) {
              styles[key].props = node.style
            }
            break
          case 'grid':
            if ('layoutGrids' in node) {
              styles[key].props = node.layoutGrids
            }
            break
          case 'background':
            if ('background' in node) {
              styles[key].props = node.background
            }
            break
          default:
            // should cover fill, stroke and effect
            styles[key].props = node[styleType + 's']
        }
      }
    })
  }

  if ('children' in node) {
    node.children.forEach(
      (child) =>
        (styles = { ...styles, ...findStyleInNode(keysToFind, child, styles) }),
    )
  }

  return styles
}

const Header = ({ text }) => (
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
  const [token, setToken] = useState('')
  const [file, setFile] = useState('')
  const [output, setOutput] = useState('figmaStyles')
  const [typescript, setTypescript] = useState(false)

  // Data from Figma
  const [fileName, setFileName] = useState('')
  const [fills, setFills] = useState([])
  const [typography, setTypography] = useState([])

  // Internal State
  const [loading, setLoading] = useState(true)
  const [hasConfig, setHasConfig] = useState(false)
  const [watching] = useState(process.argv.slice(2)[0] === 'watch')
  const [client, setClient] = useState<Figma.ClientInterface>(null)

  // 📡 Function to connect to Figma and get the data we need
  // --------------------------------------------------------

  const fetchData = async () => {
    if (client && file) {
      const result = await client.file(file)

      setFileName(result.data.name)

      const styleValues = findStyleInNode(
        Object.keys(result.data.styles),
        result.data.document,
      )

      Object.entries(styleValues).map(([key, values]) => {
        styleValues[key] = { ...result.data.styles[key], ...values }
      })

      // reformat the styles
      const formattedStyles = figmaToJson(styleValues)

      // Make sure the output directory exists
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true })
      }

      // write out our file

      fs.writeFileSync(
        path.join(output, `index.${typescript ? 'ts' : 'js'}`),
        `
        const styles = ${util.inspect(formattedStyles, {
          depth: Infinity,
          compact: false,
        })} ${typescript ? 'as const' : ''}

        ${
          typescript
            ? `
          export type FillNames = typeof styles.fill[number]['name']
          export type TextNames = typeof styles.text[number]['name']
          `
            : ''
        }

        export default styles`,
      )

      setLoading(false)

      // set our local state
      setFills(formattedStyles.fill)
      setTypography(formattedStyles.text)
    }
  }

  // ⚓️ Hooks!
  // ---------

  // 🛠 Initial Setup
  useEffect(() => {
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
  useEffect(() => {
    const fetch = async () => {
      fetchData()
    }
    fetch()
  }, [client])

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
