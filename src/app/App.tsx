import { RouterProvider } from "react-router";
import { LanguageProvider } from "./providers/LanguageProvider";
import { router } from "./routes";

export default function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
