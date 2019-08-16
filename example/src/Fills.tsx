import React from 'react'
import { FigmintFillStyleType } from 'figmint'

// @ts-ignore
import pngs from '../figma/fillImages/*.png'

const Fill: React.FC<{ fill: FigmintFillStyleType }> = ({ fill }) => {
  return (
    <div>
      <h3>{fill.name}</h3>
      <ul>
        {fill.styles.map((style, index) => {
          let fillExample = <div>This fill type not yet supported!</div>

          switch (style.type) {
            case 'SOLID': {
              fillExample = (
                <span
                  style={{
                    display: 'inline-block',
                    width: 200,
                    height: 20,
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
                    width: 200,
                    height: 200,
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
                  width={200}
                  height={200}
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

export const Fills: React.FC<{ fills: FigmintFillStyleType[] }> = ({
  fills,
}) => {
  return (
    <div>
      <h2>Fills:</h2>
      {fills.map((fill, index) => (
        <Fill fill={fill} key={index} />
      ))}
    </div>
  )
}
