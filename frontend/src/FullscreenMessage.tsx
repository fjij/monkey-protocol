import { ReactNode } from "react";
import LandingBackground from "./assets/landing.png";

export default function FullscreenMessage(
  { children }: { children?: ReactNode; }
) {
  return (
    <div className="FullscreenMessage">
      <div
        className="L-background"
        style={{ backgroundImage: `url(${LandingBackground})` }}
      >
        <div className="title">
          <h1>{ children }</h1>
        </div>
      </div>
    </div>
  );
}
