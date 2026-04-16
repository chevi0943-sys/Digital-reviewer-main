import React, { useRef, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void; // הפונקציה שתקבל את הקובץ לאחר הצילום
  onCancel: () => void;            // פונקציה לסגירת המצלמה בלי לצלם
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  // הפעלת המצלמה
  const startCamera = useCallback(async () => {
    try {
      // בקשת הרשאה למצלמה (מעדיף מצלמה אחורית אם יש, אבל במחשב לרוב יש רק קדמית)
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("שגיאה בגישה למצלמה:", err);
      setError('לא הצלחנו לגשת למצלמה. אנא ודא שאישרת גישה.');
    }
  }, []);

  // הפעלת המצלמה ברגע שהקומפוננטה עולה
  React.useEffect(() => {
    startCamera();
    
    // ניקוי - כיבוי המצלמה כשהקומפוננטה נסגרת
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]); // חשוב! השתמשנו ב-useCallback כדי למנוע רינדורים מיותרים

  // פונקציית צילום
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // התאמת גודל הקנבס לגודל הוידאו
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // ציור הפריים הנוכחי מהוידאו לקנבס
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // המרת הקנבס לקובץ תמונה (Blob -> File)
        canvas.toBlob((blob) => {
          if (blob) {
            // יצירת קובץ 'מדומה' כמו שמתקבל מ-input type="file"
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            // כיבוי המצלמה
            if (stream) stream.getTracks().forEach(track => track.stop());
            
            // שליחת הקובץ החוצה
            onCapture(file);
          }
        }, 'image/jpeg', 0.9); // איכות התמונה
      }
    }
  };

  const handleCancel = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    onCancel();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    }}>
      {error ? (
        <div style={{ color: 'white', textAlign: 'center' }}>
          <p>{error}</p>
          <button onClick={handleCancel} style={{ padding: '10px 20px', marginTop: '20px' }}>סגור</button>
        </div>
      ) : (
        <>
          {/* הוידאו שמציג את המצלמה בזמן אמת */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', maxWidth: '500px', borderRadius: '10px', backgroundColor: 'black' }}
          />
          
          {/* קנבס נסתר המשמש לצילום */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <button onClick={handleCancel} style={{
              padding: '12px 24px', backgroundColor: '#475569', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer'
            }}>
              ביטול
            </button>
            <button onClick={takePhoto} style={{
              padding: '12px 30px', backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px'
            }}>
              📸 צלם
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
