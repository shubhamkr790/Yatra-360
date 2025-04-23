
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    // This is just to log the authentication state for debugging
    console.log("Auth state:", { user, isLoading });
  }, [user, isLoading]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirecting to Dashboard if logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show login page if not logged in
  return <Login />;
};

export default Index;
