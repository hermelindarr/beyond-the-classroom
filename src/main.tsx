import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { PRESENTER_HASH, isPresenterWindow } from "./present/stops";

// The presenter window (opened with N) is a separate tree. The audience app
// below never imports the speaker notes.
const isPresenter = isPresenterWindow();
// A stray #presenter on the audience tab (reload, pop-ups blocked) is removed.
if (!isPresenter && location.hash === PRESENTER_HASH) history.replaceState(null, "", location.pathname + location.search);
const Root = isPresenter ? lazy(() => import("./present/PresenterView")) : lazy(() => import("./App"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
);
