import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scale, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info
        localStorage.setItem('lawlens_token', data.access_token);
        localStorage.setItem('lawlens_user', JSON.stringify({
          id: data.user_id,
          subscription_tier: data.subscription_tier
        }));

        toast({
          title: "Login Successful",
          description: "Welcome back to LawLens!",
        });

        // Redirect based on subscription
        if (data.subscription_tier === 'pro' || data.subscription_tier === 'enterprise') {
          navigate('/dashboard');
        } else {
          navigate('/summarize');
        }
      } else {
        setError(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Demo mode fallback
      if (email === 'demo@lawlens.ai' && password === 'demo123') {
        localStorage.setItem('lawlens_token', 'demo-token');
        localStorage.setItem('lawlens_user', JSON.stringify({
          id: 1,
          subscription_tier: 'pro'
        }));
        
        toast({
          title: "Demo Login Successful",
          description: "Welcome to LawLens Demo!",
        });
        
        navigate('/dashboard');
      } else {
        setError('Network error. Try demo credentials: demo@lawlens.ai / demo123');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Scale className="h-10 w-10 text-purple-400" />
            <span className="text-3xl font-bold text-white">
              Law<span className="text-purple-400">Lens</span>
            </span>
          </Link>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white text-center">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Enter your credentials to access LawLens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="text-center">
                <span className="text-gray-400">Don't have an account? </span>
                <Link to="/signup" className="text-purple-400 hover:text-purple-300">
                  Sign up
                </Link>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-300 font-medium mb-2">Demo Credentials</h4>
              <p className="text-blue-200 text-sm">
                Email: <code className="bg-blue-500/20 px-1 rounded">demo@lawlens.ai</code>
              </p>
              <p className="text-blue-200 text-sm">
                Password: <code className="bg-blue-500/20 px-1 rounded">demo123</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
