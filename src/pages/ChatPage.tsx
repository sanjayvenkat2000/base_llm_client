import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Input } from '../components/ui-shadcn/input';
import { Button } from '../components/ui-shadcn/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui-shadcn/avatar';

const ChatPage = () => {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [showChart, setShowChart] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.toLowerCase().includes('s&p') || query.toLowerCase().includes('spy')) {
      setShowChart(true);
    }
    // Normally would send query to API
  };

  return (
    <div className="flex flex-1 flex-grow items-center  min-h-[calc(100vh-64px)] text-center px-4">
      {/* Main content */}
      
      <h1>Hello ....</h1>
    </div>
  );
};

export default ChatPage; 