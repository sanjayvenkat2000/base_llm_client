import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import LandingPage from "../pages/LandingPage";
import ChatPage from "../pages/ChatPage";
import MainLayout from "../components/layout/MainLayout";

// Protected Route component
export const ProtectedRoute = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <LandingPage />,
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      }
    ]
  }
]); 