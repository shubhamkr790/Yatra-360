
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  LogOut, 
  Moon, 
  Sun, 
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { signOut, user } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Yatra360</span>
            <span className="text-sm font-medium text-muted-foreground">Admin</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link to="/tour-guides" className="text-sm font-medium transition-colors hover:text-primary">
            Tour Guides
          </Link>
          <Link to="/approvals" className="text-sm font-medium transition-colors hover:text-primary">
            Approvals
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          {user && (
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                <User className="inline-block h-4 w-4 mr-1" />
                {user.email}
              </div>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleSignOut}>
                <LogOut size={16} /> Logout
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
          <nav className="container grid gap-6 p-6">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/tour-guides" 
              className="flex items-center gap-2 text-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tour Guides
            </Link>
            <Link 
              to="/approvals" 
              className="flex items-center gap-2 text-lg font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Approvals
            </Link>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              {user && (
                <Button variant="outline" size="sm" className="gap-1" onClick={handleSignOut}>
                  <LogOut size={16} /> Logout
                </Button>
              )}
            </div>
            {user && (
              <div className="text-sm font-medium py-2 border-t">
                <User className="inline-block h-4 w-4 mr-1" />
                {user.email}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
