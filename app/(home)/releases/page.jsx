import "../../home-css/releases.css";
import Releases from "./Releases.jsx";

export const metadata = {
  title: "Releases · APM",
  description: "What changed in the APM desktop app, pm and APM for Chrome, release by release."
};

export default function Page() {
  return <Releases />;
}
