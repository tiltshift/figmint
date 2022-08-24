import * as Figma from 'figma-js'
import { exportFormatOptions } from 'figma-js'

export type RawPropObject =
  | Figma.TypeStyle
  | ReadonlyArray<Figma.Paint | Figma.LayoutGrid | Figma.Effect>

export type RawStyleType = Figma.Style & {
  props: RawPropObject
  fileName?: string
}

export type ExportType = Figma.ExportSetting

export type ExportsObject = {
  [key: string]: {
    name: string
    page: string
    folder: string
    exportInfo: Readonly<ExportType[]>
  }
}

export type RawStyleObject = {
  [key: string]: RawStyleType
}

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

export type BaseEffectStyleType = Omit<Figma.Effect, 'color'> & {
  color?: string
}

export type FigmintStyle<T> = {
  key: string
  name: string
  styles: T extends BaseFillStyleType
  ? BaseFillStyleType[]
  : T extends BaseTypeStyleType
  ? BaseTypeStyleType[]
  : T extends BaseEffectStyleType
  ? BaseEffectStyleType | BaseEffectStyleType[]
  : []
}

export type FigmintFillStyleType = FigmintStyle<BaseFillStyleType>
export type FigmintTypeStyleType = FigmintStyle<BaseTypeStyleType>
export type FigmintEffectStyleType = FigmintStyle<BaseEffectStyleType>

export type PartialFigmintExportType = {
  id: string
  format: exportFormatOptions
  scale: number
  page: string
  group: string
  name: string
  url?: string
  directory?: string
  file?: string
}

export type FigmintExportType = {
  [group: string]: {
    [fileName: string]: {
      svg?: Required<PartialFigmintExportType>
      pdf?: Required<PartialFigmintExportType>
      png?: {
        [scale: number]: Required<PartialFigmintExportType>
      }
      jpg?: {
        [scale: number]: Required<PartialFigmintExportType>
      }
    }
  }
}

export type FigmintOutput = {
  fillStyles: FigmintFillStyleType[]
  textStyles: FigmintTypeStyleType[]
  effectStyles: FigmintEffectStyleType[]
  gridStyles: any[]
  exports: FigmintExportType
}
