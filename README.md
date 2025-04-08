# Grok Clone

A React application that mimics the Grok interface with authentication and protected routes.

## Technologies Used

- React with TypeScript
- Vite for fast development
- shadcn/ui for UI components
- Tailwind CSS for styling
- React Router for routing
- Clerk for authentication

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd custom-chat
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Configuration

1. Replace the placeholder Clerk publishable key in `src/lib/clerk.ts` with your actual Clerk publishable key.

### Development

Start the development server:

```
npm run dev
```

### Building for Production

Build the app for production:

```
npm run build
```

## Features

- Landing page with sign-in button
- Authentication with Clerk
- Protected /chat route that requires authentication
- Chat interface similar to Grok
- Mock response for S&P 500 queries

## Project Structure

- `/src/components/ui`: UI components based on shadcn/ui
- `/src/lib`: Utility functions and configurations
- `/src/pages`: Page components for different routes
