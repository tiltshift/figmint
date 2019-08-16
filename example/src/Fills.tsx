import React from 'react'
import { FigmintFillStyleType } from 'figmint'

// @ts-ignore
import pngs from '../figma/fillImages/*.png'

const Fill: React.FC<{ fillStyle: FigmintFillStyleType }> = ({ fillStyle }) => {
  return (
    <div style={{ margin: 20 }}>
      <h3>{fillStyle.name}</h3>
      <ul>
        {fillStyle.styles.map((style, index) => {
          let fillExample = <div>This fill type not yet supported!</div>

          switch (style.type) {
            case 'SOLID': {
              fillExample = (
                <span
                  style={{
                    display: 'inline-block',
                    width: 70,
                    height: 70,
                    backgroundColor: style.color,
                  }}
                />
              )
              break
            }
            case 'GRADIENT_LINEAR': {
              let gradientString = 'linear-gradient('

              style.stops.forEach((stop, index) => {
                gradientString += `${stop.color} ${stop.y * 100}%${
                  style.stops.length - 1 > index ? ',' : ''
                }`
              })

              gradientString += ')'

              fillExample = (
                <span
                  style={{
                    display: 'inline-block',
                    width: 70,
                    height: 70,
                    background: gradientString,
                  }}
                />
              )
              break
            }
            case 'IMAGE': {
              const imageFileParts = style.fileName.split('/')

              const [imageName, ext] = imageFileParts[
                imageFileParts.length - 1
              ].split('.')

              let imageSrc

              switch (ext) {
                case 'png':
                  imageSrc = pngs[imageName]
                  break
              }

              fillExample = imageSrc ? (
                <img
                  alt="figma background"
                  width={70}
                  height={70}
                  src={imageSrc}
                />
              ) : (
                <span>Image Type `{ext}` not yet supported in example.</span>
              )
            }
          }

          return <li key={index}>{fillExample}</li>
        })}
      </ul>
    </div>
  )
}

export const Fills: React.FC<{ fillStyles: FigmintFillStyleType[] }> = ({
  fillStyles,
}) => {
  return (
    <div>
      <h2>Fills:</h2>
      {fillStyles.map((fillStyle, index) => (
        <Fill fillStyle={fillStyle} key={index} />
      ))}
    </div>
  )
}
