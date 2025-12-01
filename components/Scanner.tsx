import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Check, X, MapPin, Loader2 } from 'lucide-react';
import { analyzeBikeImage } from '../services/geminiService';
import { GeoLocationData, BikeReport } from '../types';

interface ScannerProps {
  userId: string;
  defaultRegion: string;
  onClose: () => void;
  onSubmit: (report: BikeReport) => void;
}

export const Scanner: React.FC<ScannerProps> = ({ userId, defaultRegion, onClose, onSubmit }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [location, setLocation] = useState<GeoLocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Prefer back camera
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("カメラへのアクセスが拒否されました。設定を確認してください。");
        console.error(err);
      }
    };

    // Initialize Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (err) => {
          setLocationError("位置情報を取得できませんでした。");
          console.error(err);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setLocationError("お使いの端末はGPSに対応していません。");
    }

    startCamera();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      
      // Start OCR
      setIsAnalyzing(true);
      try {
        const result = await analyzeBikeImage(imageData);
        if (result.number) {
          setOcrResult(result.number);
        } else {
          setOcrResult(""); // None found
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, []);

  const handleRetake = () => {
    setCapturedImage(null);
    setOcrResult('');
    setIsAnalyzing(false);
  };

  const handleSubmit = () => {
    if (!location) {
        alert("位置情報が必要です。");
        return;
    }
    const report: BikeReport = {
        id: crypto.randomUUID(),
        userId,
        region: defaultRegion,
        bikeNumber: ocrResult,
        location: location,
        timestamp: new Date().toISOString(),
        status: 'submitted'
    };
    onSubmit(report);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col h-full w-full">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent text-white">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
        <div className="text-sm font-medium bg-black/40 px-3 py-1 rounded-full flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-400" />
          {location ? "GPS取得済み" : "GPS検索中..."}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="mb-4 text-red-400">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-white text-black rounded-lg">戻る</button>
          </div>
        ) : !capturedImage ? (
          /* Live Camera View */
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-40 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-500 -mb-1 -mr-1"></div>
                <p className="absolute -bottom-8 w-full text-center text-white text-sm font-medium shadow-black drop-shadow-md">
                    登録番号を枠に合わせてください
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Preview & Edit View */
          <div className="w-full h-full relative">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain bg-black/90" />
            
            {/* Analysis Overlay */}
            <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl p-6 animate-slide-up">
               {isAnalyzing ? (
                 <div className="flex flex-col items-center justify-center py-8">
                   <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
                   <p className="text-slate-600">端末内で解析中...</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">読み取り結果</h3>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                            登録番号 / 車体番号
                        </label>
                        <input 
                            type="text" 
                            value={ocrResult}
                            onChange={(e) => setOcrResult(e.target.value)}
                            placeholder="読み取り不能 - 手動入力してください"
                            className="w-full text-2xl font-mono font-bold border-b-2 border-slate-200 focus:border-brand-500 outline-none py-2 bg-transparent"
                        />
                        {!ocrResult && <p className="text-xs text-orange-500 mt-1">番号が見つかりませんでした。手動で入力してください。</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <div className="bg-slate-100 p-2 rounded">
                            <span className="block font-bold text-slate-700">日時</span>
                            {location?.timestamp ? new Date(location.timestamp).toLocaleString('ja-JP') : '--'}
                        </div>
                        <div className="bg-slate-100 p-2 rounded">
                            <span className="block font-bold text-slate-700">場所</span>
                            {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : '未取得'}
                        </div>
                    </div>
                    
                    <div className="pt-2 flex gap-3">
                        <button onClick={handleRetake} className="flex-1 py-3 border border-slate-300 rounded-xl font-medium text-slate-600 active:bg-slate-50">
                            撮り直す
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={!ocrResult || !location}
                            className={`flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-200
                                ${!ocrResult || !location ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 active:bg-brand-700'}
                            `}
                        >
                            <Check className="w-5 h-5" /> 送信する
                        </button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Capture Button Bar (Only visible when live) */}
      {!capturedImage && !error && (
        <div className="absolute bottom-0 left-0 w-full p-8 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent">
          <button 
            onClick={captureImage}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group active:scale-95 transition-transform"
          >
            <div className="w-16 h-16 bg-white rounded-full group-hover:bg-brand-100 transition-colors"></div>
          </button>
        </div>
      )}

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};