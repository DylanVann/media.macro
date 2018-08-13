# media.macro

Load images using a [babel macro](https://github.com/kentcdodds/babel-plugin-macros).

## Features

- Works for images and videos
  - We use [sharp](https://sharp.pixelplumbing.com/) for images.
  - We use [ffmpeg](https://www.ffmpeg.org/) for videos.
- Optimize.
  - Keep lossless media in your project and optimize at compile time.
- Convert.
  - Convert your media into other formats.
  - Use WebP with PNG fallbacks.
- Create responsive sizes.
  - Load media at the lowest resolution needed for crisp display.
- Gives you dimension information so you can avoid layout thrashing.

## Usage

```bash
npm install babel-plugin-media
# or
yarn add babel-plugin-media
```

### Input

```js
import media from "media.macro";

const MyImage = media("./my-image.png");
```

### Output

```js
const MyImage = {
  height: 100,
  width: 100,
  imgSrc: "...",
  imgWebPSrc: "...",
  imgSrcSet: "...",
  imgWebPSrcSet: "...",
  imgBase64: "...",
  videoSrc: "...",
  videoPosterSrc: "...",
  videoPosterWebPSrc: "...",
  videoPosterBase64: "..."
};

const MyComponent = () => <FastImage {...MyImage} />;
```

### Displaying the Image

This macro will work well with `react-fast-image`.
This is optional though, you can consume the output however you want.

```js
import FastImage from "react-fast-image";
import media from "media.macro";

const MyComponent = () => <FastImage {...media("./my-image.png")} />;
```

### Options

You can pass options to the `media` macro.

```js
import media from "media.macro";

const MyImage = media("./my-image.png", {
  maxWidth: 1024,
  toImgFormat: "png",
  toVideoFormat: "mp4",
  toVideoPosterFormat: "png",
});
```

## License

[MIT](LICENSE)
