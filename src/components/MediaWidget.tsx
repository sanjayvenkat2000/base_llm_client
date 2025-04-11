import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Monitor, X, Camera as CameraIcon } from 'lucide-react';
import { Button } from './ui/button';

type MediaState = 'default' | 'camera' | 'screen_capture';

// Add proper type declaration for getDisplayMedia
declare global {
  interface MediaDevices {
    getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  }
}

export const MediaWidget = () => {
  const [state, setState] = useState<MediaState>('default');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pendingStream, setPendingStream] = useState<MediaStream | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Effect to set the stream once the video element is available
  useEffect(() => {
    if (pendingStream && videoRef.current) {
      videoRef.current.srcObject = pendingStream;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
      mediaStreamRef.current = pendingStream;
      setPendingStream(null);
    }
  }, [pendingStream]);

  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        // Stop any existing stream before starting a new one
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      // Set the pending stream and update state to render video element
      setPendingStream(stream);
      setState('camera');
      setCapturedImage(null);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startScreenShare = async () => {
    try {
      if (mediaStreamRef.current) {
        // Stop any existing stream before starting a new one
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false
      });
      
      // Set the pending stream and update state to render video element
      setPendingStream(stream);
      setState('screen_capture');
      setCapturedImage(null);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const stopCapture = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setState('default');
    setCapturedImage(null);
  };

  // Restore the previous media stream when canceling an image
  const cancelImage = () => {
    setCapturedImage(null);
  };

  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        try {
          // Convert to data URL and log as JSON
          const imageData = canvas.toDataURL('image/jpeg');
          const timestamp = new Date().toISOString();
          const captureType = state === 'camera' ? 'camera' : 'screen_capture';
          
          const capturedData = {
            type: captureType,
            timestamp,
            imageData
          };
          
          console.log(JSON.stringify(capturedData, null, 2));
          
          // Store the captured image but don't stop the stream
          setCapturedImage(imageData);
        } catch (error) {
          console.error('Error capturing image:', error);
        }
      }
    }
  }, [state]);

  const isDefaultState = state === 'default';
  const isCapturingMedia = state === 'camera' || state === 'screen_capture';

  return (
    <div className="rounded-lg border p-4 bg-card shadow-sm w-full mb-4">
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-sm font-medium">
          {state === 'default' 
            ? 'Media Capture' 
            : state === 'camera' 
              ? 'Camera Capture' 
              : 'Screen Capture'}
        </h3>
        {isCapturingMedia && (
          <Button variant="outline" size="sm" onClick={stopCapture}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
      </div>
      
      {/* Media display container - only shown in camera or screen_capture states */}
      {isCapturingMedia && (
        <div className="relative w-full flex justify-center mb-4">
          <div className="w-[500px] h-[350px] bg-black rounded-md flex items-center justify-center overflow-hidden relative">
            {/* Video feed */}
            {!capturedImage && (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted 
                className="w-full h-full object-contain absolute top-0 left-0"
              />
            )}
            
            {/* Captured image */}
            {capturedImage && (
              <div className="relative w-full h-full">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-3 right-3">
                  <Button onClick={cancelImage} variant="destructive">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Take picture button - only shown when not showing a captured image */}
          {!capturedImage && (
            <div className="absolute bottom-3 right-3 flex space-x-2">
              <Button onClick={captureImage}>
                <CameraIcon className="h-4 w-4 mr-1" />
                Take Picture
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Media selection buttons */}
      <div className={`flex justify-center space-x-4 ${isDefaultState ? 'mt-4' : ''}`}>
        <Button 
          variant={state === 'camera' ? 'default' : 'outline'} 
          onClick={startCamera}
          className="flex items-center space-x-2"
          disabled={isCapturingMedia && capturedImage !== null}
        >
          <Camera className="h-4 w-4" />
          <span>Camera</span>
        </Button>
        
        <Button 
          variant={state === 'screen_capture' ? 'default' : 'outline'} 
          onClick={startScreenShare}
          className="flex items-center space-x-2"
          disabled={isCapturingMedia && capturedImage !== null}
        >
          <Monitor className="h-4 w-4" />
          <span>Screen Share</span>
        </Button>
      </div>
    </div>
  );
}; 