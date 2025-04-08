import { useNavigate } from 'react-router-dom';
import { SignedIn, useAuth } from '@clerk/clerk-react';
import { Button } from '../components/ui/button';


const LandingPage = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate('/chat');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center px-4">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to Experiments.</h1>
        <p className="text-xl mb-8">Login to get started</p>
        <SignedIn>
          <Button onClick={handleGetStarted}>Get Started</Button>
        </SignedIn>
      </div>
    </div>
  );
};

export default LandingPage; 