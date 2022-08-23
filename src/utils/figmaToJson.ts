import * as Figma from 'figma-js'

import {
  figmaColorToHSL,
  RawStyleObject,
  BaseFillStyleType,
  FigmintImage,
  FigmintOutput,
  FigmintSolid,
  FigmintGradient,
  BaseEffectStyleType,
} from './'

export const figmaToJson = (figmaObject: RawStyleObject): FigmintOutput => {
  const formattedStyles = ({
    fillStyles: [],
    textStyles: [],
    effectStyles: [],
    gridStyles: [],
    exports: [],
  } as unknown) as FigmintOutput

  Object.values(figmaObject).forEach((style) => {
    const baseStyle = {
      key: style.key,
      name: style.name,
    }

    let styleProps

    switch (style.styleType) {
      case 'FILL': {
        const fillStyles = [] as BaseFillStyleType[]

        styleProps = style.props as Figma.Paint[]

        styleProps.forEach((fill) => {
          let workingStyle = {
            type: fill.type,
            blendMode: fill.blendMode,
          } as BaseFillStyleType

          switch (fill.type) {
            case 'SOLID':
              workingStyle = {
                ...workingStyle,

                // we bake opacity into the color for SOLID
                color: figmaColorToHSL({
                  ...(fill.color as Figma.Color),
                  a: fill.opacity ? fill.opacity : 1,
                }),
              } as FigmintSolid

              break
            case 'GRADIENT_LINEAR':
            case 'GRADIENT_RADIAL':
            case 'GRADIENT_ANGULAR':
            case 'GRADIENT_DIAMOND': {
              const stops = fill.gradientStops as NonNullable<
                typeof fill.gradientStops
              >
              const handlePositions = fill.gradientHandlePositions as NonNullable<
                typeof fill.gradientHandlePositions
              >
              workingStyle = {
                ...workingStyle,
                stops: stops.map((stop, index) => {
                  return {
                    color: figmaColorToHSL(stop.color),
                    y:
                      fill.type === 'GRADIENT_LINEAR'
                        ? stop.position
                        : handlePositions[index].y,
                    x:
                      fill.type === 'GRADIENT_LINEAR'
                        ? undefined
                        : handlePositions[index].x,
                  }
                }),
              } as FigmintGradient
              break
            }
            case 'IMAGE': {
              workingStyle = {
                ...workingStyle,
                fileName: style.fileName,
              } as FigmintImage
              break
            }
            case 'EMOJI': {
              // not sure what this is :)
              workingStyle = { ...workingStyle } as FigmintImage
            }
          }

          fillStyles.unshift(workingStyle)
        })

        formattedStyles.fillStyles.push({
          ...baseStyle,
          styles: fillStyles,
        })

        break
      }
      case 'TEXT':
        styleProps = style.props as Figma.TypeStyle

        formattedStyles.textStyles.push({
          ...baseStyle,
          styles: {
            ...styleProps,
            lineHeight: styleProps.lineHeightPx / styleProps.fontSize,
            fontStyle: styleProps.italic ? 'italic' : 'inherit',
          },
        })
        break
      case 'EFFECT':
        styleProps = style.props as ReadonlyArray<Figma.Effect>

        formattedStyles.effectStyles.push({
          ...baseStyle,
          styles: styleProps.map((effect) => {
            const baseEffect: BaseEffectStyleType = { ...effect, color: effect.color ? figmaColorToHSL(effect.color) : undefined }

            return baseEffect
          }),
        })

        break
      case 'GRID':
        break
    }
  })

  return formattedStyles
}
