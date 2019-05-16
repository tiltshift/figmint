import * as Figma from 'figma-js'
import tinycolor from 'tinycolor2'

export type RawStyleType = Figma.Style & {
  props?: [Figma.Paint | Figma.Text | Figma.Frame]
}

export type RawStyleObject = { string?: RawStyleType }

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
}

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

const figmaColorToHSL = (figmaColor: Figma.Color) =>
  tinycolor.fromRatio(figmaColor).toHslString()

export const figmaToJson = (
  figmaObject: RawStyleObject,
): {
  fill: FigmintFillStyleType[]
  text: FigmintTypeStyleType[]
  effect: any[]
  grid: any[]
} => {
  const formattedStyles = {
    fill: [],
    text: [],
    effect: [],
    grid: [],
  }

  Object.values(figmaObject).forEach((style) => {
    let baseStyle = {
      key: style.key,
      name: style.name,
      styles: undefined,
    }

    switch (style.styleType) {
      case 'FILL':
        baseStyle.styles = []

        style.props.forEach((fill: Figma.Paint) => {
          let workingStyle: FigmintFillStyleType = {
            type: fill.type,
            blendMode: fill.blendMode,
          } as FigmintFillStyleType

          switch (fill.type) {
            case 'SOLID':
              workingStyle = {
                ...workingStyle,

                // we bake opacity into the color for SOLID
                color: figmaColorToHSL({
                  ...fill.color,
                  a: fill.opacity,
                }),
              } as FigmintSolid

              break
            case 'GRADIENT_LINEAR':
            case 'GRADIENT_RADIAL':
            case 'GRADIENT_ANGULAR':
            case 'GRADIENT_DIAMOND':
              workingStyle = {
                ...workingStyle,
                stops: fill.gradientStops.map((stop, index) => {
                  return {
                    color: figmaColorToHSL(stop.color),
                    y:
                      fill.type === 'GRADIENT_LINEAR'
                        ? stop.position
                        : fill.gradientHandlePositions[index].y,
                    x:
                      fill.type === 'GRADIENT_LINEAR'
                        ? null
                        : fill.gradientHandlePositions[index].x,
                  }
                }),
              } as FigmintGradient
              break
            case 'IMAGE':
              workingStyle = { ...workingStyle } as FigmintImage
              // TODO https://github.com/tiltshift/figmint/issues/2
              break
            case 'EMOJI':
              workingStyle = { ...workingStyle } as FigmintImage
          }

          baseStyle.styles.unshift(workingStyle)
        })

        formattedStyles.fill.push(baseStyle)

        break
      case 'TEXT':
        baseStyle.styles = style.props
        baseStyle.styles.lineHeight =
          baseStyle.styles.lineHeightPx / baseStyle.styles.fontSize

        formattedStyles.text.push(baseStyle)
        break
      case 'EFFECT':
        break
      case 'GRID':
        break
    }
  })

  return formattedStyles
}
