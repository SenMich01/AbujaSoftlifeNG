```javascript
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles.css";

/*
|--------------------------------------------------------------------------
| Root Element
|--------------------------------------------------------------------------
| Make sure index.html contains:
|
| <div id="root"></div>
|
*/

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    'Abuja Life could not start because <div id="root"></div> was not found in index.html.'
  );
}

/*
|--------------------------------------------------------------------------
| Start Abuja Life
|--------------------------------------------------------------------------
*/

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
