import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, RefreshCw, SendHorizontal } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useServiceProvider } from '@/components/service-provider';
import { useQuery } from '@tanstack/react-query';
import { AuthTest } from '@/components/AuthTest';
// User message component
const UserMessage = ({ message, onEdit, onDelete }: { 
  message: string, 
  onEdit: () => void, 
  onDelete: () => void 
}) => {
  return (
    <div className="group relative flex justify-end mb-4 pr-1">
      <div className="relative max-w-[95%]">
        <div className="rounded-lg bg-primary px-4 py-3 text-primary-foreground">
          <p className="text-sm">{message}</p>
        </div>
        <div className="absolute bottom-0 right-0 translate-y-full pt-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// AI response component
const AIResponse = ({ message, onRegenerate }: { 
  message: string, 
  onRegenerate: () => void 
}) => {
  return (
    <div className="mb-6">
      <div className="max-w-[90%] rounded-lg bg-muted px-4 py-3 text-muted-foreground">
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
      <div className="mt-2 flex">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onRegenerate}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Regenerate</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Regenerate</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

// Chat input component
const ChatInput = ({ onSend }: { onSend: (message: string) => void }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 rounded-lg border bg-background p-2"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Experiment..."
        className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none"
      />
      <Button type="submit" size="sm" className="shrink-0">
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
};

const ChatPage = () => {

  const serviceProvider  = useServiceProvider();

  const {data} = useQuery({
    queryKey: ['chat'],
    queryFn: () => serviceProvider.getProtected()
  })
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    role: 'user' | 'assistant';
  }>>([
    {
      id: '1',
      content: 'Why is the sky blue, ue because of the way Earths atmosphere scatters sunlight. When sunlight enters the a',
      role: 'user'
    },
    {
      id: '2',
      content: `The sky appears blue because of the way Earth's atmosphere scatters sunlight. When sunlight enters the atmosphere, it's made up of all colors of light, but the gas molecules and tiny particles in the air are more effective at scattering shorter wavelengths, like blue and violet. This process is called Rayleigh scattering.

Our eyes are more sensitive to blue light than violet, so we predominantly perceive the sky as blue. On a clear day, this scattering happens all around, giving the sky its uniform color. During sunrise or sunset, the sky can turn red or orange because the light passes through more atmosphere, and the shorter blue wavelengths get scattered out of view, leaving the longer red ones behind.`,
      role: 'assistant'
    },
    {
      id: '3',
      content: 'Why is the sky blue',
      role: 'user'
    },
    {
      id: '4',
      content: `Again and Again, same answer. The sky appears blue because of the way Earth's atmosphere scatters sunlight. When sunlight enters the atmosphere, it's made up of all colors of light, but the gas molecules and tiny particles in the air are more effective at scattering shorter wavelengths, like blue and violet. This process is called Rayleigh scattering.

Our eyes are more sensitive to blue light than violet, so we predominantly perceive the sky as blue. On a clear day, this scattering happens all around, giving the sky its uniform color. During sunrise or sunset, the sky can turn red or orange because the light passes through more atmosphere, and the shorter blue wavelengths get scattered out of view, leaving the longer red ones behind.`,
      role: 'assistant'
    },
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      role: 'user' as const
    };
    setMessages([...messages, newMessage]);
    // Here you would typically send the message to your backend
    // and then add the response to the messages
  };

  const handleEditMessage = (id: string) => {
    // Implement edit functionality
    console.log('Edit message', id);
  };

  const handleDeleteMessage = (id: string) => {
    // Implement delete functionality
    setMessages(messages.filter(msg => msg.id !== id));
  };

  const handleRegenerateResponse = () => {
    // Implement regenerate functionality
    console.log('Regenerate response');
  };

  console.log(`Server response: ${JSON.stringify(data)}`);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] mt-[80px] relative z-0">
      {/* Messages area with scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[786px] mx-auto px-4 py-4">
          {messages.map((message) => (
            message.role === 'user' ? (
              <UserMessage 
                key={message.id}
                message={message.content}
                onEdit={() => handleEditMessage(message.id)}
                onDelete={() => handleDeleteMessage(message.id)}
              />
            ) : (
              <AIResponse
                key={message.id}
                message={message.content}
                onRegenerate={handleRegenerateResponse}
              />
            )
          ))}
          
          {/* Auth testing components */}
          <div className="mt-6 pt-4 border-t">
            <AuthTest />
            <AuthTest />
          </div>
        </div>
      </div>

      {/* Chat input fixed at bottom */}
      <div className="border-t p-4 bg-background sticky bottom-0 w-full">
        <div className="max-w-[786px] mx-auto">
          <ChatInput onSend={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 