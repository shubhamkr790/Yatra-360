
import AuthForm from '@/components/AuthForm';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent to-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Yatra360
        </h1>
        <p className="text-muted-foreground mt-2">
          Heritage Tour Admin Panel
        </p>
      </div>
      
      <AuthForm />
      
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Connect tour guides with heritage enthusiasts
      </p>
    </div>
  );
};

export default Login;
