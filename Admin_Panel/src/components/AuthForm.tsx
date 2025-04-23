
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AtSign, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type AuthMode = "login" | "register";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const { signIn, signUp, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account",
        });
        // Switch to login mode after registration
        setMode("login");
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {mode === "login" ? "Admin Login" : "Register Admin Account"}
        </CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Enter your credentials to access the admin panel" 
            : "Create an admin account to manage tour guides"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@yatra360.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === "login" && (
                <Button variant="link" className="p-0 h-auto text-xs" type="button">
                  Forgot password?
                </Button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "login" ? "Logging in..." : "Registering..."}
              </>
            ) : (
              mode === "login" ? "Login" : "Register"
            )}
          </Button>
          <Button 
            type="button" 
            variant="link" 
            className="text-sm" 
            onClick={toggleMode}
          >
            {mode === "login" 
              ? "Don't have an account? Register" 
              : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthForm;
