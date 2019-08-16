import * as Figma from 'figma-js'

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

export type BaseFillStyleType = FigmintSolid | FigmintGradient | FigmintImage
export type BaseTypeStyleType = Figma.TypeStyle & {
  lineHeight: number
  fontStyle: string
}

export type FigmintStyle<T> = {
  key: string
  name: string
  styles: T extends BaseFillStyleType
    ? BaseFillStyleType[]
    : T extends BaseTypeStyleType
    ? BaseTypeStyleType
    : []
}

export type FigmintFillStyleType = FigmintStyle<BaseFillStyleType>
export type FigmintTypeStyleType = FigmintStyle<BaseTypeStyleType>

export type FigmintOutput = {
  fillStyles: FigmintFillStyleType[]
  textStyles: FigmintTypeStyleType[]
  effectStyles: any[]
  gridStyles: any[]
}
