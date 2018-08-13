import React from "react";
import { FastImage } from "react-fast-image";
import media from "media.macro";

const App = () => <FastImage {...media("./image.png")} />;

export default App;
