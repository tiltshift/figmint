import React from 'react'
import useInterval from 'use-interval'
import camelCase from 'camelcase'

import * as Figma from 'figma-js'

import { cosmiconfig } from 'cosmiconfig'

import fs from 'fs'
import path from 'path'
import util from 'util'
import rimraf from 'rimraf'

import prettier from 'prettier'

import { Text, Box, Color, render } from 'ink'

import { StyleFill } from './StyleFill'
import { StyleText } from './StyleText'

import { Frame } from './Frame'
import { ErrorBox } from './Error'

import {
  getStylesFromFile,
  FigmintFillStyleType,
  FigmintTypeStyleType,
  FigmintExportType,
  downloadImage,
  PartialFigmintExportType,
  FigmintGradient,
  BaseTypeStyleType,
  BaseEffectStyleType,
} from './utils'
import { exportFormatOptions } from 'figma-js'

// export our types for clients to use
export * from './utils/types'

// clear the console
process.stdout.write('\x1Bc')

// Local Types
type DownloadListType = {
  [formatScale: string]: PartialFigmintExportType[]
}

type FinalExportsType = {
  [page: string]: {
    [fileName: string]: {
      svg?: PartialFigmintExportType
      pdf?: PartialFigmintExportType
      png?: {
        [scale: number]: PartialFigmintExportType
      }
      jpg?: {
        [scale: number]: PartialFigmintExportType
      }
    }
  }
}

// Components

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
  const [file, setFile] = React.useState('')
  const [output, setOutput] = React.useState('figmaStyles')
  const [typescript, setTypescript] = React.useState(false)

  // Data from Figma
  const [fileName, setFileName] = React.useState('')
  const [fills, setFills] = React.useState<FigmintFillStyleType[]>([])
  const [typography, setTypography] = React.useState<FigmintTypeStyleType[]>([])
  const [exports, setExports] = React.useState<FigmintExportType>()

  // Internal State
  const [loading, setLoading] = React.useState(true)
  const [hasConfig, setHasConfig] = React.useState(false)
  const [watching] = React.useState(process.argv.slice(2)[0] === 'watch')
  const [client, setClient] = React.useState<Figma.ClientInterface>()

  // Function to get an image URL from figma given some params

  const fetchAndAddImageUrls = React.useCallback(
    async (downloadLists: DownloadListType, finalExports: FinalExportsType) => {
      if (client && file) {
        const baseDirectory = path.join(output, 'exports')

        // Clear out the output dir if it already exists
        if (fs.existsSync(baseDirectory)) {
          rimraf.sync(baseDirectory)
        }

        fs.mkdirSync(baseDirectory, { recursive: true })

        await Promise.all(
          Object.keys(downloadLists).map(async (format) => {
            if (downloadLists[format].length > 0) {
              let imageResponse

              // first we get the image urls from figma based on format and scale
              if (format === 'svg' || format === 'pdf') {
                imageResponse = await client.fileImages(file, {
                  format,
                  ids: downloadLists[format].map((image) => image.id),
                })
              } else {
                imageResponse = await client.fileImages(file, {
                  format: downloadLists[format][0].format,
                  scale: downloadLists[format][0].scale,
                  ids: downloadLists[format].map((image) => image.id),
                })
              }

              // next we use these urls to download the images and add the url and file info to our exports object
              Object.entries(imageResponse.data.images).forEach(([id, url]) => {
                const image = downloadLists[format].find(
                  (image) => image.id === id,
                )

                if (image) {
                  // store images based on the page
                  const outDirectory = path.join(
                    baseDirectory,
                    camelCase(image.page),
                  )

                  // image file name based on format and scale
                  const outFile = `${image.name}${
                    image.scale > 1 ? `@${image.scale}x` : ''
                  }.${image.format}`

                  const outUrl = path.join(outDirectory, outFile)

                  // make sure the directory for this image exists directory exists
                  if (!fs.existsSync(outDirectory)) {
                    fs.mkdirSync(outDirectory, { recursive: true })
                  }

                  downloadImage(url, outUrl)

                  if (image.format === 'png' || image.format === 'jpg') {
                    finalExports[image.page][image.name][image.format]![
                      image.scale
                    ] = {
                      ...finalExports[image.page][image.name][image.format]![
                        image.scale
                      ],
                      url: outUrl,
                      directory: outDirectory,
                      file: outFile,
                    }
                  } else {
                    finalExports[image.page][image.name][image.format] = {
                      ...finalExports[image.page][image.name][image.format]!,
                      url: outUrl,
                      directory: outDirectory,
                      file: outFile,
                    }
                  }
                }
              })
            }
          }),
        )

        return finalExports
      }
      throw new Error('client and file needed to run this function')
    },
    [client, file, output],
  )

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
      const { styles, exports } = await getStylesFromFile(
        fileResponse.data,
        imageFillsResponse.data,
        output,
      )

      // 🖼 time to get export images!

      const finalExports: FinalExportsType = {}

      const downloadLists: DownloadListType = {}

      // first we look at all the various exports found in the file.
      // We need to note the scale and format so we can ask for images
      // of the right type and format from the figma API.

      Object.entries(exports).forEach(([id, info]) => {
        info.exportInfo.forEach((image) => {
          const name = info.name
          const group = info.folder
          const page = info.page
          const format = image.format.toLowerCase() as exportFormatOptions
          const scale =
            image.constraint.type === 'SCALE' ? image.constraint.value : 1

          const imageDetails = {
            id,
            format,
            page,
            group,
            name,
            scale,
          }

          if (!(page in finalExports)) {
            finalExports[page] = {}
          }

          if (!(name in finalExports[page])) {
            finalExports[page][name] = {}
          }

          // vector images don't have a scale
          if (format === 'svg' || format === 'pdf') {
            finalExports[page][name][format] = imageDetails

            if (!(format in downloadLists)) {
              downloadLists[format] = []
            }

            downloadLists[format].push(imageDetails)
          } else if (format === 'png' || format === 'jpg') {
            if (!(format in finalExports[page][name])) {
              finalExports[page][name][format] = {}
            }
            finalExports[page][name][format]![scale] = imageDetails

            const formatScale = format + `@${scale}x`

            if (!(formatScale in downloadLists)) {
              downloadLists[formatScale] = []
            }

            downloadLists[formatScale].push(imageDetails)
          }
        })
      })

      // Once we know everything we need about our exports we fetch the image URL's from figma
      // we group these by file type to reduce the number of requests.

      styles.exports = (await fetchAndAddImageUrls(
        downloadLists,
        finalExports,
      )) as FigmintExportType

      // write out our file

      let colors = {} as { [colorName: string]: string }
      let gradients = {} as { [gradientName: string]: FigmintGradient }
      let imageFills = {} as { [imageFillName: string]: string }
      let textStyles = {} as { [name: string]: BaseTypeStyleType }
      let effectStyles = {} as { [name: string]: BaseEffectStyleType }

      styles.fillStyles.forEach((fill) => {
        fill.styles.forEach((style) => {
          switch (style.type) {
            case 'SOLID':
              colors[camelCase(fill.name)] = style.color
              break
            case 'GRADIENT_LINEAR':
            case 'GRADIENT_RADIAL':
            case 'GRADIENT_ANGULAR':
            case 'GRADIENT_DIAMOND':
              gradients[camelCase(fill.name)] = style
              break
            case 'IMAGE':
              imageFills[camelCase(fill.name)] = style.fileName
          }
        })
      })

      styles.textStyles.forEach((text) => {
        textStyles[camelCase(text.name)] = text.styles
      })

      styles.effectStyles.forEach((effect) => {
        effectStyles[camelCase(effect.name)] = effect.styles
      })

      const options = await prettier.resolveConfig(output)

      fs.writeFileSync(
        path.join(output, `index.${typescript ? 'ts' : 'js'}`),
        prettier.format(
          `
        const styles = {
        colors: ${util.inspect(colors, {
          depth: Infinity,
          compact: false,
        })},
        gradients: ${util.inspect(gradients, {
          depth: Infinity,
          compact: false,
        })},
        imageFills: ${util.inspect(imageFills, {
          depth: Infinity,
          compact: false,
        })},
        textStyles: ${util.inspect(textStyles, {
          depth: Infinity,
          compact: false,
        })},
        effectStyles: ${util.inspect(effectStyles, {
          depth: Infinity,
          compact: false,
        })},
        raw: ${util.inspect(styles, {
          depth: Infinity,
          compact: false,
        })},
        }${typescript ? ' as const' : ''}

        ${
          typescript
            ? `
          export type ColorValues = keyof typeof styles.colors
          export type GradientValues = keyof typeof styles.gradients
          export type TextValues = keyof typeof styles.textStyles
          export type EffectValues = keyof typeof styles.effectStyles
          `
            : ''
        }

        export default styles`,
          { ...options, parser: typescript ? 'typescript' : 'babel' },
        ),
      )

      setLoading(false)

      // set our local state
      setFills(styles.fillStyles)
      setTypography(styles.textStyles)
      setExports(styles.exports)
    }
  }, [client, fetchAndAddImageUrls, file, output, typescript])

  // ⚓️ Hooks!
  // ---------

  // 🛠 Initial Setup
  React.useEffect(() => {
    const processConfig = async () => {
      const explorer = cosmiconfig('figmint')

      const configResult = await explorer.search()

      if (configResult) {
        setHasConfig(true)

        if ('file' in configResult.config) {
          setFile(configResult.config.file)
        }

        if ('output' in configResult.config) {
          setOutput(configResult.config.output)
        }

        if ('typescript' in configResult.config) {
          setTypescript(configResult.config.typescript)
        }

        if (configResult.config.token) {
          setClient(
            Figma.Client({
              personalAccessToken: configResult.config.token,
            }),
          )
        }
      }
    }
    processConfig()
  }, [])

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
        <ErrorBox>
          Figmint requires a config.
          (https://github.com/tiltshift/figmint#config)
        </ErrorBox>
      </Frame>
    )
  }

  if (!client) {
    return (
      <Frame>
        <ErrorBox>
          Figma Token is required. (https://github.com/tiltshift/figmint#token)
        </ErrorBox>
      </Frame>
    )
  }

  if (!file) {
    return (
      <Frame>
        <ErrorBox>
          Figma File is required. (https://github.com/tiltshift/figmint#file)
        </ErrorBox>
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
        {exports && (
          <Box flexDirection="column">
            <Header text="Exports" />
            <Box textWrap="wrap">
              <Text>
                Exports are working, but we don't display anything here yet...
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Frame>
  )
}

render(<Output />)
