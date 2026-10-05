import { Nav, useTheme } from "./nav.jsx";
import { Intro } from "./intro.jsx";
import { Hero } from "./hero.jsx";
import { Compat, OpenSource, Faq, Download, Footer } from "./closing.jsx";
import { Surfaces } from "./surfaces.jsx";
import { Features } from "./features.jsx";
import { Security } from "./security.jsx";
import { Agents } from "./agents.jsx";
import { Cli } from "./cli.jsx";
import { Move } from "./move.jsx";

function Page() {
  const theme = useTheme();
  return (
    <div className="page">
      <Nav theme={theme} />
      <main>
        <Intro />
        <Hero />
        <Compat />
        <Surfaces />
        <Features />
        <Security />
        <Agents />
        <Cli />
        <Move />
        <OpenSource />
        <Faq />
        <Download />
      </main>
      <Footer theme={theme} />
    </div>
  );
}

export default Page;
