const styles = {
  fill: [
    {
      key: '88444a04efcd66828e0564463a04ef693735f176',
      name: 'Red',
      styles: [
        {
          type: 'SOLID',
          blendMode: 'NORMAL',
          color: 'hsl(0, 79%, 63%)',
        },
      ],
    },
  ],
  text: [],
  effect: [],
  grid: [],
} as const

export type SolidColors = typeof styles.fill[number]['styles'][number]['color']
export type FillNames = typeof styles.fill[number]['name']
export type TextNames = typeof styles.text[number]['name']

export default styles
