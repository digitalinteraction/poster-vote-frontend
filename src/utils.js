import color from 'color'

export const isEmail = (str) => /^\S+@\S+$/.test(str)

export function randomColour() {
  const hue = Math.floor(Math.random() * 360)
  return color.hsl(hue, 99, 53).hex()
}
