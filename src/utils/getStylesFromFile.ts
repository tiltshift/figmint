import * as Figma from 'figma-js'

import { RawStyleObject, RawStyleType, ImageFillArray } from './'
import { figmaToJson } from './figmaToJson'

export const getStylesFromFile = (
  file: Figma.FileResponse,
  imageFills: Figma.FileImageFillsResponse,
) => {
  const styleDefinitions = Object.keys(file.styles)

  const styleValues = findStyleInNode(styleDefinitions, file.document)

  const images: ImageFillArray = []

  Object.entries(styleValues).forEach(([key, style]) => {
    // combine the style meta-data with the actuall style values (props)
    const combinedStyle = { ...file.styles[key], ...style }

    // if we're an image fill grab the image url
    if (combinedStyle.styleType === 'FILL') {
      const fills = style.props as Figma.Paint[]

      fills.forEach((fill) => {
        if (fill.type === 'IMAGE' && fill.imageRef) {
          images.push({
            imageRef: fill.imageRef,
            url: imageFills.meta.images[fill.imageRef],
          })
        }
      })
    }

    styleValues[key] = { ...file.styles[key], ...style }
  })

  return { styles: figmaToJson(styleValues), imageFills: images }
}

// work through the node and its children to attach all style definitions to the style types
const findStyleInNode = (
  keysToFind: string[],
  node: Figma.Node,
  styles: RawStyleObject = {},
): RawStyleObject => {
  let finalStyles = styles

  if ('styles' in node) {
    Object.entries(node.styles).forEach(([styleType, key]) => {
      if (!(key in styles)) {
        finalStyles[key] = {} as RawStyleType

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
          case 'stroke':
            if ('strokes' in node) {
              styles[key].props = node.strokes
            }
            break
          case 'fill':
            if ('fills' in node) {
              styles[key].props = node.fills
            }
            break
          case 'effect':
            if ('effects' in node) {
              styles[key].props = node.effects
            }
        }
      }
    })
  }

  if ('children' in node) {
    node.children.forEach(
      (child) =>
        (finalStyles = {
          ...finalStyles,
          ...findStyleInNode(keysToFind, child, styles),
        }),
    )
  }

  return finalStyles
}
