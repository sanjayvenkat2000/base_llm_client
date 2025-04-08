import { useState } from "react";
import { useServiceProvider } from "./service-provider";

export function AuthTest() {
  const { isAuthenticated, getProtected, testAuthFormats } = useServiceProvider();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestAuth = async () => {
    if (!isAuthenticated) {
      setError("You must be authenticated to test the API");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // This will try different authentication formats and log results to console
      await testAuthFormats();
      setResult("Check the console for authentication format test results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCallProtected = async () => {
    if (!isAuthenticated) {
      setError("You must be authenticated to call the protected API");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await getProtected();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="border rounded-md p-4 bg-card">
        <h2 className="text-xl font-semibold mb-4">Authentication Testing</h2>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground">
            Status: {isAuthenticated ? "Authenticated ✅" : "Not Authenticated ❌"}
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <button 
            onClick={handleTestAuth}
            disabled={loading || !isAuthenticated}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            Test Auth Formats
          </button>
          
          <button 
            onClick={handleCallProtected}
            disabled={loading || !isAuthenticated}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            Call Protected API
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center">
            <p>Loading...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-2 bg-green-100 border border-green-300 rounded-md">
            <pre className="text-xs whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 