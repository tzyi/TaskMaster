import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import Inbox from "./components/Inbox";
import Register from "./components/Register";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { 
    path: "/register", 
    element: (
      <AuthProvider>
        <Register />
      </AuthProvider>
    )
  },
  { 
    path: "/inbox", 
    element: (
      <AuthProvider>
        <Inbox />
      </AuthProvider>
    ) 
  },
]);
