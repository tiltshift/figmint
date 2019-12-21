import fs from 'fs'
import https from 'https'
import path from 'path'

import imageType from 'image-type'

import { ImageFill } from '.'

export const downloadImage = function(url: string, outFile: string) {
  const file = fs.createWriteStream(outFile)

  https
    .get(url, function(response) {
      response.pipe(file)
      file.on('finish', function() {
        file.close()
      })
    })
    .on('error', function(err) {
      fs.unlink(outFile, () => {}) // Delete the file async.
      throw err
    })
}

export const downloadFillImage = (image: ImageFill, outputDir: string) => {
  return new Promise<string>((resolve) => {
    // figure out the file type
    https.get(image.url, (response) => {
      response.on('readable', () => {
        const chunk = response.read(imageType.minimumBytes)
        response.destroy()

        const imageExt = imageType(chunk)

        // once we know the file type write the file
        if (imageExt) {
          const imageFillDir = path.join(outputDir, 'fillImages')

          // make sure the fillImages directory exists
          if (!fs.existsSync(imageFillDir)) {
            fs.mkdirSync(imageFillDir, { recursive: true })
          }

          const outFile = path.join(
            imageFillDir,
            `${image.imageRef}.${imageExt.ext}`,
          )

          downloadImage(image.url, outFile)

          resolve(outFile)
        }
      })
    })
  })
}
