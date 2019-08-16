import React from 'react'

import styles from '../figma'

import { Fills } from './Fills'

export const App: React.FC = () => {
  return (
    <div>
      <h1>🍃 Figmint Example App</h1>
      <iframe
        title="Figma Source File"
        style={{ border: 'none' }}
        width="800"
        height="450"
        src="https://www.figma.com/embed?embed_host=figmint&url=https%3A%2F%2Fwww.figma.com%2Ffile%2Ftid5SFlwk8AqMGBP6dDJvw%2FFigmint-Example%3Fnode-id%3D0%253A1"
      />
      <Fills fills={styles.fills} />
    </div>
  )
}
