const path = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  root: path.join(__dirname, "example"),
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.ts'),
      name: 'media-processor',
      fileName: (format) => `media-processor.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
        }
      }
    },
    outDir: path.join(__dirname, "dist")
  }
})
