import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Inbox from "./components/Inbox";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/inbox", element: <Inbox /> },
]);
