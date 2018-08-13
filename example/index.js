import React from "react";
import { FastImage } from "react-fast-image";
import media from "media.macro";

const App = () => (
  <div style={{ display: flex, width: "100%" }}>
    <FastImage {...media("./image-1.png")} />
    <FastImage {...media("./image-2.png")} />
    <FastImage {...media("./image-3.png")} />
  </div>
);

export default App;
