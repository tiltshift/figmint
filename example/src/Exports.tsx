import React from 'react'
import { FigmintExportType } from 'figmint'

// @ts-ignore
import icons from '../figma/exports/icons/*.svg'
// @ts-ignore
import jpgImages from '../figma/exports/images/*.jpg'
// @ts-ignore
import pngImages from '../figma/exports/images/*.png'

export const Exports: React.FC<{ exports: FigmintExportType[] }> = ({
  exports,
}) => {
  return (
    <div>
      <h2>Exports:</h2>
      <ul>
        {exports.map((file, index) => {
          let image
          if (file.directory.includes('icon')) {
            image = icons[file.file.split('.')[0]]
          } else {
            if (file.format === 'jpg') {
              image = jpgImages[file.file.split('.')[0]]
            } else {
              image = pngImages[file.file.split('.')[0]]
            }
          }

          return (
            <li
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: 20,
                alignItems: 'center',
              }}
            >
              <img src={image} alt="" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
