import * as Figma from 'figma-js'

import {
  figmaColorToHSL,
  RawStyleObject,
  FigmintFillStyleType,
  FigmintTypeStyleType,
  FigmintImage,
} from './'

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
    const baseStyle = {
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
