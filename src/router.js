import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import Inbox from "./components/Inbox";
import Register from "./components/Register";
import Today from "./pages/Today";
import Calendar from "./pages/Calendar";
import Matrix from "./pages/Matrix";
import Habits from "./pages/Habits";
import Pomodoro from "./pages/Pomodoro";
import Project from "./pages/Project";

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
  { 
    path: "/today", 
    element: (
      <AuthProvider>
        <Today />
      </AuthProvider>
    ) 
  },
  { 
    path: "/calendar", 
    element: (
      <AuthProvider>
        <Calendar />
      </AuthProvider>
    ) 
  },
  { 
    path: "/matrix", 
    element: (
      <AuthProvider>
        <Matrix />
      </AuthProvider>
    ) 
  },
  { 
    path: "/habits", 
    element: (
      <AuthProvider>
        <Habits />
      </AuthProvider>
    ) 
  },
  { 
    path: "/pomodoro", 
    element: (
      <AuthProvider>
        <Pomodoro />
      </AuthProvider>
    ) 
  },
  { 
    path: "/project/:type", 
    element: (
      <AuthProvider>
        <Project />
      </AuthProvider>
    ) 
  },
]);
