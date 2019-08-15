import * as Figma from 'figma-js'
import tinycolor from 'tinycolor2'

export type RawPropObject =
  | Figma.TypeStyle
  | ReadonlyArray<Figma.Paint | Figma.LayoutGrid | Figma.Effect>

export type RawStyleType = Figma.Style & {
  props: RawPropObject
  fileName?: string
}

export type RawStyleObject = { [key: string]: RawStyleType }

export interface FigmintPaintBase {
  type: Figma.PaintType
  blendMode: Figma.BlendMode
}

export interface FigmintSolid extends FigmintPaintBase {
  type: Figma.PaintTypeSolid
  color: string
}

export interface FigmintGradient extends FigmintPaintBase {
  type: Figma.PaintTypeGraident
  stops: { x?: number; y: number; color: string }[]
}

export interface FigmintImage extends FigmintPaintBase {
  type: Figma.PaintTypeImage
  fileName: string
}

export type ImageFill = { imageRef: string; url: string }
export type ImageFillArray = ImageFill[]

export type FigmintFillStyleType = FigmintSolid | FigmintGradient | FigmintImage

export type FigmintTypeStyleType = Figma.TypeStyle & { lineHeight: number }

export type FigmintStyle<T> = {
  key: string
  name: string
  styles: T extends FigmintFillStyleType
    ? FigmintFillStyleType[]
    : T extends FigmintTypeStyleType
    ? FigmintTypeStyleType
    : []
}

export type FigmintOutput = {
  fill: FigmintStyle<FigmintFillStyleType>[]
  text: FigmintStyle<FigmintTypeStyleType>[]
  effect: any[]
  grid: any[]
}

export const figmaColorToHSL = (figmaColor: Figma.Color) =>
  tinycolor.fromRatio(figmaColor).toHslString()

export * from './downloadFillImage'
export * from './figmaToJson'
export * from './getStylesFromFile'
