import * as Figma from 'figma-js'
import tinycolor from 'tinycolor2'

export type StyleType = Figma.Style & {
  props?: [Figma.Paint | Figma.Text | Figma.Frame]
}

export type RawStyleObject = { string?: StyleType }

const figmaColorToHSL = (figmaColor: Figma.Color) =>
  tinycolor.fromRatio(figmaColor).toHslString()

export const figmaToJson = (figmaObject: RawStyleObject) => {
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
      styles: [],
    }

    switch (style.styleType) {
      case 'FILL':
        style.props.forEach((fill: Figma.Paint) => {
          switch (fill.type) {
            case 'SOLID':
              // we bake opacity into the color for SOLID
              baseStyle.styles.push({
                type: 'solid',
                color: figmaColorToHSL({ ...fill.color, a: fill.opacity }),
                blendMode: fill.blendMode,
              })
              break
            case 'GRADIENT_LINEAR':
            case 'GRADIENT_RADIAL':
            case 'GRADIENT_ANGULAR':
            case 'GRADIENT_DIAMOND':
              break
            case 'IMAGE':
              // TODO https://github.com/tiltshift/figmint/issues/2
              break
            case 'EMOJI':
          }
        })

        formattedStyles.fill.push(baseStyle)

        break
      case 'TEXT':
        break
      case 'EFFECT':
        break
      case 'GRID':
        break
    }
  })

  return formattedStyles
}
