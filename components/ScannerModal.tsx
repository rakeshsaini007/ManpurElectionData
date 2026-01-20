
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { extractAadhaarData } from '../services/geminiService';

interface ScannerModalProps {
  onCapture: (data: { aadhaar: string; dob: string; photo: string }) => void;
  onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: 1280, height: 720 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied or not available.");
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop to rectangle overlay
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Define crop area (centered rectangle)
    const cropWidth = videoWidth * 0.8;
    const cropHeight = cropWidth * 0.6;
    const startX = (videoWidth - cropWidth) / 2;
    const startY = (videoHeight - cropHeight) / 2;

    canvas.width = 640;
    canvas.height = 400;
    
    ctx.drawImage(
      video,
      startX, startY, cropWidth, cropHeight,
      0, 0, canvas.width, canvas.height
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.8);
    setIsProcessing(true);
    
    const extracted = await extractAadhaarData(base64Image);
    
    if (extracted) {
      onCapture({ 
        aadhaar: extracted.aadhaar, 
        dob: extracted.dob, 
        photo: base64Image 
      });
      onClose();
    } else {
      setError("Failed to extract data. Please try again with better lighting.");
      setIsProcessing(false);
    }
  }, [onCapture, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-4 bg-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Scan Aadhaar Card</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <div className="relative aspect-video bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
              {error}
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[80%] h-[60%] border-2 border-dashed border-white/70 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500 text-center">
            Position the Aadhaar card within the box for auto-extraction.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={handleCapture}
              disabled={isProcessing || !!error}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Extracting...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-camera"></i>
                  Capture & Scan
                </>
              )}
            </button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ScannerModal;
