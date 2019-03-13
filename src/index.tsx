import * as React from 'react'
import { useState, useEffect } from 'react'
import * as Figma from 'figma-js'
import useInterval from 'use-interval'
import cosmiconfig from 'cosmiconfig'

import { Color, Text, Box, render } from 'ink'
import Spinner from 'ink-spinner'

import { FoundColor } from './FoundColor'

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
  const [watch] = useState<boolean>(process.argv.slice(2)[0] === 'watch')

  const [client, setClient] = useState<Figma.ClientInterface>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [styles, setStyles] = useState<{ [index: string]: StyleType }>({})

  // Initial Setup
  useEffect(() => {
    const explorer = cosmiconfig('figmasync')

    const configResult = explorer.searchSync()

    if (configResult) {
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
    if (client) {
      const result = await client.file(file)

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
  useInterval(fetchData, watch ? 1000 : null)

  // initial data fetch
  useEffect(() => {
    const fetch = async () => {
      fetchData()
    }
    fetch()
  }, [client])

  if (!client) {
    return (
      <Box margin={1}>
        <Color red>❌ Error: </Color>
        <Text>
          Figma Token is required.
          (https://www.figma.com/developers/docs#access-tokens)
        </Text>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box margin={1}>
        <Color green>
          <Spinner />
        </Color>{' '}
        Loading data from Figma
      </Box>
    )
  } else {
    return (
      <Box flexDirection="column" marginBottom={1}>
        {watch && (
          <Box flexDirection="row" margin={1}>
            <Color green>
              <Spinner />
            </Color>
            <Color gray>
              <Text italic> Watching for changes in figma...</Text>
            </Color>
          </Box>
        )}
        <Box marginBottom={1}>
          <Text bold>Color Styles:</Text>
        </Box>
        {Object.entries(styles).map(([key, style]) => (
          <FoundColor key={key} {...style} />
        ))}
      </Box>
    )
  }
}

render(<Output />)
