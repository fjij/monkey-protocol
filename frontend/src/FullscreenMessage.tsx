import { ReactNode } from "react";

export default function FullscreenMessage(
  { children }: { children?: ReactNode; }
) {
  return (
    <div className="FullscreenMessage">
      <div className="title">
        <h1>{ children }</h1>
      </div>
    </div>
  );
}
