import * as Figma from 'figma-js'
import tinycolor from 'tinycolor2'

export const figmaColorToHSL = (figmaColor: Figma.Color) =>
  tinycolor.fromRatio(figmaColor).toHslString()

export * from './types'
export * from './downloadImages'
export * from './figmaToJson'
export * from './getStylesFromFile'
