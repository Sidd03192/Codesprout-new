import Hero from "./hero";
import Bento from "./bento";
const { default: Navbar } = require("./navbar");

import BackgroundEffects from "./background-effects";
import StickyScroll from "./sticky-scroll";
import Pricing from "./pricing";

export const Landing = () => {
  return (
    <div className="max-h-screen overflow-y-scroll overflow-x-hidden relative">
      <BackgroundEffects />
      <Navbar />{" "}
      <main>
        <Hero />
        <Bento />
        <StickyScroll />
        <Pricing />
      </main>
    </div>
  );
};
