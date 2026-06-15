import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimalPreset,
    apple: {
      sizes: [180],
      padding: 0,
    },
    maskable: {
      sizes: [512],
      padding: 0,
    },
    transparent: {
      sizes: [192, 512],
      padding: 0,
      favicons: [[64, 'favicon.ico']],
    },
  },
  images: ['public/pwa-icon.svg'],
})
