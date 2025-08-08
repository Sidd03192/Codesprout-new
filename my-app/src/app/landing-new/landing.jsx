import Hero from "./hero";
import Bento from "./bento";
const { default: Navbar } = require("./navbar");

export const Landing = () => {
  return (
    <div className="max-h-screen overflow-y-scroll overflow-x-hidden">
      <Navbar />{" "}
      <main>
        <Hero />
        <Bento />
        {/* <Services />
        <Testimonials />
        <Pricing />
        <CTA /> */}
      </main>
    </div>
  );
};
