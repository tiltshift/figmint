import * as React from 'react'
import * as Figma from 'figma-js'

import { Text, Box, Color } from 'ink'

export const StyleText: React.FC<{ styles: Figma.TypeStyle }> = ({
  styles,
}) => <Text>Text!</Text>
