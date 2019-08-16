import React from 'react'
import { FigmintTypeStyleType } from 'figmint'

export const Text: React.FC<{ textStyles: FigmintTypeStyleType[] }> = ({
  textStyles,
}) => {
  return (
    <div>
      <h2>Text:</h2>
      <ul>
        {textStyles.map((textStyle, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: textStyle.styles.fontFamily,
                fontWeight: textStyle.styles.fontWeight,
                fontSize: textStyle.styles.fontSize,
                lineHeight: textStyle.styles.lineHeight,
                fontStyle: textStyle.styles.fontStyle,
              }}
            >
              This text is in textStyle "{textStyle.name}"
            </span>
            <span>
              family: {textStyle.styles.fontFamily}, Weight:{' '}
              {textStyle.styles.fontWeight}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
