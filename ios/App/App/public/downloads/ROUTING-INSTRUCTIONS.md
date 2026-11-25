# Add the public download route

This package intentionally does not replace your `App.tsx` or alter your protected-route setup.

In your existing router file:

1. Add the import (adjust the relative path if your router file is in a different directory):

   `import Download from "./pages/download/Download";`

2. Add this route to the PUBLIC route group, outside any authentication/protected-route wrapper:

   `<Route path="/download" element={<Download />} />`

3. Do not add a second router or duplicate your existing `<BrowserRouter>`.

The page component is the default export from `src/pages/download/Download.tsx`.

If your router is not `src/App.tsx`, use the equivalent import path relative to the file where your `<Routes>` are defined.
