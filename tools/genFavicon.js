#!/usr/bin/env node

const sharp = require('sharp')
const fs = require('fs')
const { join } = require('path')

// 6px

const path = 'public/large-icon.png'
const outdir = 'public/img/icons'
// const background = { r: 70, g: 87, b: 117, alpha: 1 }
const background = '#465775'

let sizeList = [
  { width: 192, height: 192, name: 'android-chrome-192x192.png' },
  { width: 512, height: 512, name: 'android-chrome-512x512.png' },
  { width: 60, height: 60, name: 'apple-touch-icon-60x60.png' },
  { width: 76, height: 76, name: 'apple-touch-icon-76x76.png' },
  { width: 120, height: 120, name: 'apple-touch-icon-120x120.png' },
  { width: 152, height: 152, name: 'apple-touch-icon-152x152.png' },
  { width: 180, height: 180, name: 'apple-touch-icon-180x180.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' },
  { width: 16, height: 16, name: 'favicon-16x16.png', radius: 3 },
  { width: 32, height: 32, name: 'favicon-32x32.png', radius: 6 },
  { width: 144, height: 144, name: 'msapplication-icon-144x144.png' },
  { width: 150, height: 150, name: 'mstile-150x150.png' },
]

function roundEdges(width, height, radius) {
  return Buffer.from(
    `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}"/></svg>`
  )
}

// https://github.com/lovell/sharp/blob/master/README.md#stream

;(async () => {
  const resolve = (...paths) => join(__dirname, '..', ...paths)
  const inputFile = fs.readFileSync(resolve(path))

  fs.mkdirSync(resolve(outdir), { recursive: true })

  await Promise.all(
    sizeList.map(({ name, width, height, radius = 0 }) => {
      let promise = sharp(inputFile).resize(width, height, { background })

      if (radius > 0) {
        promise = promise.composite([
          { input: roundEdges(width, height, radius), blend: 'dest-in' },
        ])
      }

      return promise.toFile(resolve(outdir, name))
    })
  )
})()
