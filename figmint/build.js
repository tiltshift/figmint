;(async () => {
  let esbuild = require('esbuild')

  let result = await esbuild.build({
    entryPoints: ['src/index.tsx'],
    bundle: true,
    platform: 'node',
    outfile: 'bin/figmint.js',
    sourcemap: true,
    target: 'node14',
    minify: true,
    metafile: true,
    drop: ['debugger', 'console'],
    external: ['react-devtools-core'],
  })

  let text = await esbuild.analyzeMetafile(result.metafile)
  console.log(text)
})()
