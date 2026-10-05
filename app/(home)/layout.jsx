import "../../vendor/design-system/tokens.css";
import "../../vendor/design-system/bundle.css";
import "../../vendor/design-system/extension.css";
import "../home-css/base.css";
import "../home-css/nav.css";
import "../home-css/intro.css";
import "../home-css/hero.css";
import "../home-css/stage.css";
import "../home-css/sections.css";
import "../home-css/footer.css";
import { THEME_SCRIPT } from "../theme-script.js";

export const metadata = {
  title: "APM — the open source password manager",
  description: "APM is the open source password manager: one encrypted file on your computer, used from the desktop app, the terminal, Chrome and your AI tools."
};

export default function HomeLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
