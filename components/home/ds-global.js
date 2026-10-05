// The design-system bundle reads React from window, so expose it before the bundle runs.
import React from "react";

window.React = React;
