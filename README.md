# media.macro [![CircleCI](https://circleci.com/gh/DylanVann/media.macro.svg?style=svg)](https://circleci.com/gh/DylanVann/media.macro)

Load images using a [babel macro](https://github.com/kentcdodds/babel-plugin-macros).

## Features

-   Works for images and videos
    -   We use [sharp](https://sharp.pixelplumbing.com/) for images.
    -   We use [ffmpeg](https://www.ffmpeg.org/) for videos.
-   Optimize.
    -   Keep lossless media in your project and optimize at compile time.
-   Convert.
    -   Convert your media into other formats.
    -   Use WebP with PNG fallbacks.
-   Create responsive sizes.
    -   Load media at the lowest resolution needed for crisp display.
-   Gives you dimension information so you can avoid layout thrashing.

## Usage

To use this you must install and configure [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros).

```bash
npm install media.macro
# or
yarn add media.macro
```

### Input

```js
import media from 'media.macro'

const MyImage = media('./my-image.png')
```

### Output

```js
const MyImage = {
    height: 100,
    width: 100,
    imgSrc: '...',
    imgWebPSrc: '...',
    imgSrcSet: '...',
    imgWebPSrcSet: '...',
    imgBase64: '...',
    videoSrc: '...',
    videoPosterSrc: '...',
    videoPosterWebPSrc: '...',
    videoPosterBase64: '...',
}
```

### Displaying the Image

This macro will work well with [react-fast-image](https://github.com/DylanVann/react-fast-image).
This is optional though, you can consume the output however you want.

```jsx
import FastImage from 'react-fast-image'
import media from 'media.macro'

const MyComponent = () => <FastImage {...media('./my-image.png')} />
```

### Options

You can pass options to the `media` macro.

Two important options are `outputPath` and `publicPath`.
These options determine where the output media files go in the file tree, and how to build the URL for them.

```js
import media from 'media.macro'

const MyImage = media('./my-image.png', {
    maxWidth: 1024,
    toImgFormat: 'png',
    toVideoFormat: 'mp4',
    toVideoPosterFormat: 'png',
    // For create-react-app these could be:
    outputPath: 'public/static',
    publicPath: 'static',
})
```

## License

[MIT](LICENSE)
