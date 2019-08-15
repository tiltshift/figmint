import fs from 'fs'
import https from 'https'
import path from 'path'

import imageType from 'image-type'

import { ImageFill, ImageFillArray } from './'

const downloadImage = function(
  image: ImageFill,
  parentDir: string,
  ext: string,
) {
  const outputDir = path.join(parentDir, 'fillImages')

  // make sure the fillImages directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const out = path.join(outputDir, `${image.imageRef}.${ext}`)
  const file = fs.createWriteStream(out)
  https
    .get(image.url, function(response) {
      response.pipe(file)
      file.on('finish', function() {
        file.close()
      })
    })
    .on('error', function(err) {
      fs.unlink(out, () => {}) // Delete the file async.
      throw err
    })
}

export const downloadFillImages = (
  images: ImageFillArray,
  outputDir: string,
) => {
  images.forEach((image) => {
    // figure out the file type
    https.get(image.url, (response) => {
      response.on('readable', () => {
        const chunk = response.read(imageType.minimumBytes)
        response.destroy()

        const imageExt = imageType(chunk)

        // once we know the file type write the file
        if (imageExt) {
          downloadImage(image, outputDir, imageExt.ext)
        }
      })
    })
  })
}
