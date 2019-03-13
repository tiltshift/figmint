import * as React from 'react'
import { useState, useEffect } from 'react'
import * as Figma from 'figma-js'
import useInterval from 'use-interval'
import cosmiconfig from 'cosmiconfig'

import { Text, Box, render } from 'ink'

import { FoundColor } from './FoundColor'
import { Frame } from './Frame'
import { Error } from './Error'

// clear the console
process.stdout.write('\x1Bc')

export type StyleType = Figma.Style & Figma.Paint

const findStyleInNode = (keysToFind: string[], node: Figma.Node): {} => {
  let styles = {}

  if ('styles' in node) {
    // @ts-ignore https://github.com/jongold/figma-js/pull/13
    Object.entries(node.styles).forEach(([styleType, key]) => {
      // @ts-ignore https://github.com/jongold/figma-js/pull/13
      styles[key] = node[styleType + 's'][0]
    })
  }
  if ('children' in node) {
    node.children.forEach(
      (child) =>
        (styles = { ...styles, ...findStyleInNode(keysToFind, child) }),
    )
  }

  return styles
}

const Output = () => {
  // args
  const [token, setToken] = useState<string>('')
  const [file, setFile] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [hasConfig, setHasConfig] = useState<boolean>(false)
  const [watching] = useState<boolean>(process.argv.slice(2)[0] === 'watch')
  const [client, setClient] = useState<Figma.ClientInterface>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const [styles, setStyles] = useState<{ [index: string]: StyleType }>({})

  // Initial Setup
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
    }

    if (token) {
      setClient(
        Figma.Client({
          personalAccessToken: token,
        }),
      )
    }
  }, [token, file])

  const fetchData = async () => {
    if (client && file) {
      const result = await client.file(file)

      setFileName(result.data.name)

      const styleValues = findStyleInNode(
        Object.keys(result.data.styles),
        result.data.document,
      )

      const combinedStyleData = {}

      Object.entries(styleValues).forEach(([key, values]) => {
        combinedStyleData[key] = { ...result.data.styles[key], ...values }
      })

      setLoading(false)
      setStyles(combinedStyleData)
    }
  }

  // if we're watching, keep rechecking the figma file
  useInterval(fetchData, watching ? 1000 : null)

  // initial data fetch
  useEffect(() => {
    const fetch = async () => {
      fetchData()
    }
    fetch()
  }, [client])

  // ⚠️ Error Handling

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

  return (
    <Frame loading={loading} watching={watching} fileName={fileName}>
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Color Styles:</Text>
        </Box>
        {Object.entries(styles).map(([key, style]) => (
          <FoundColor key={key} {...style} />
        ))}
      </Box>
    </Frame>
  )
}

render(<Output />)
