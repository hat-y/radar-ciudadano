import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [
      '#eaf3fb', // 0 - muy claro
      '#d4e7f7', // 1
      '#a9cff0', // 2
      '#7eb6e8', // 3
      '#569ddf', // 4
      '#3b6ea9', // 5 - color base
      '#2f5c8d', // 6
      '#264b73', // 7
      '#1e3b5a', // 8
      '#162c43', // 9 - más oscuro
    ],
  },
  fontFamily: 'Roboto, sans-serif',
})
