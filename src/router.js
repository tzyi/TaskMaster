import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import Inbox from "./components/Inbox";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { 
    path: "/inbox", 
    element: (
      <AuthProvider>
        <Inbox />
      </AuthProvider>
    ) 
  },
]);
