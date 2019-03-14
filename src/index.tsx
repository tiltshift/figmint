import * as React from 'react'
import { useState, useEffect } from 'react'
import useInterval from 'use-interval'

import * as Figma from 'figma-js'

import cosmiconfig from 'cosmiconfig'

import fs from 'fs'
import path from 'path'

import { Text, Box, render } from 'ink'

import { figmaToJson, RawStyleObject, StyleType } from './utils'

import { Fill } from './Fill'
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

const Output = () => {
  // 📝 State
  // --------

  // Config
  const [token, setToken] = useState<string>('')
  const [file, setFile] = useState<string>('')
  const [output, setOutput] = useState<string>('figmaStyles.json')

  // Data from Figma
  const [fileName, setFileName] = useState<string>('')
  const [fills, setFills] = useState([])

  // Internal State
  const [hasConfig, setHasConfig] = useState<boolean>(false)
  const [watching] = useState<boolean>(process.argv.slice(2)[0] === 'watch')
  const [client, setClient] = useState<Figma.ClientInterface>(null)
  const [loading, setLoading] = useState<boolean>(true)

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
      const outDir = path.dirname(output)

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true })
      }
      fs.writeFileSync(
        path.resolve(
          output.indexOf('.json') === -1 ? output + '.json' : output,
        ),
        JSON.stringify(formattedStyles, null, 2),
      )

      setLoading(false)

      // set our local state
      setFills(formattedStyles.fill)
    }
  }

  // ⚓️ Hooks!
  // ---------

  // 🛠 Initial Setup
  useEffect(() => {
    const explorer = cosmiconfig('figmasync')

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
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Fill Styles:</Text>
        </Box>
        {fills.map((fill) => (
          <Fill key={fill.key} fill={fill} />
        ))}
      </Box>
    </Frame>
  )
}

render(<Output />)
