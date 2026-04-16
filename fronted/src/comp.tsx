// import React, { useState, useEffect, ChangeEvent } from 'react';
// import myData from '../data.json';
// import CameraCapture from './CameraCapture';
// import { ButtonHTMLAttributes } from 'react';
// //import button from './Button';
// import Button from './Button';
// import './iii.css';

// // === הטיפוסים שלנו ===
// interface PropertyCharacteristics {
//   area_sqm: number;
//   rooms: number;
//   bathrooms: number;
//   has_balcony: boolean;
//   balcony_area_sqm: number;
//   has_storage_room: boolean;
//   has_parking: boolean;
//   declared_finish_level: string;
//   // שים לב: toilets_count לא קיים ב-JSON המקורי ששלחת,
//   // אם אתה רוצה להשתמש בו, כדאי להגדיר אותו כאופציונלי:
//   toilets_count?: number;
// }

// interface SessionData {
//   session_id: string;
//   timestamp: string;
//   customer_details: any; // אפשר לפרט יותר אם צריך
//   property_details: any;
//   property_characteristics: PropertyCharacteristics;
//   security_and_safety: any;
//   requested_coverage: any;
//   underwriting_questions: any;
//   pricing_result: any;
// }

// type TaskStatus = 'pending' | 'analyzing' | 'uploaded' | 'rejected';

// interface Task {
//   id: string;
//   name: string;
//   status: TaskStatus;
//   file: File | null;
//   aiFeedback?: string;
//   allowOverride?: boolean;
// }
// interface Task {
//   id: string;
//   name: string;
//   status: TaskStatus;
//   file: File | null;
//   previewUrl?: string; // <-- הוספנו את השורה הזו
//   aiFeedback?: string;
//   allowOverride?: boolean;
// }

// const checkIsBlurry = async (file: File): Promise<{ isBlurry: boolean; score: number }> => {
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onload = async (e) => {
//       const img = new Image();
//       img.onload = () => {
//         // @ts-ignore - OpenCV (cv) נטען גלובלית מהסקריפט
//         const cv = window.cv;
//         if (!cv) {
//           console.warn("OpenCV not loaded yet");
//           return resolve({ isBlurry: false, score: 0 });
//         }

//         // המרת התמונה לפורמט של OpenCV
//         let src = cv.imread(img);
//         let gray = new cv.Mat();

//         // 1. המרה לשחור לבן
//         cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

//         // 2. חישוב הלפלסיאן
//         let laplacian = new cv.Mat();
//         cv.Laplacian(gray, laplacian, cv.CV_64F);

//         // 3. חישוב הוריאנס (הציון)
//         let mean = new cv.Mat();
//         let stddev = new cv.Mat();
//         cv.meanStdDev(laplacian, mean, stddev);

//         const score = stddev.data64F[0] * stddev.data64F[0]; // Variance

//         // ניקוי זיכרון (חשוב מאוד ב-OpenCV.js!)
//         src.delete(); gray.delete(); laplacian.delete(); mean.delete(); stddev.delete();

//         // סף טשטוש (Threshold) - בדרך כלל בין 100 ל-300, תלוי במצלמה
//         const THRESHOLD = 50;
//         resolve({ isBlurry: score < THRESHOLD, score });
//       };
//       img.src = e.target?.result as string;
//     };
//     reader.readAsDataURL(file);
//   });
// };

// // === סימולציית שרת ה-AI (נשאר כמו קודם) ===
// const analyzeImageInServer = async (file: File, expectedRoom: string): Promise<{ isValid: boolean, reason?: string }> => {
//   const formData = new FormData();
//   formData.append('image', file);
//   formData.append('taskId', expectedRoom);

//   try {
//     // שליחת התמונה לשרת ה-Node.js שלך בפורט 3001
//     const response = await fetch('http://localhost:3001/api/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await response.json();

//     // אם השרת החזיר 200 OK
//     if (response.ok && data.success) {
//       return { isValid: true };
//     } else {
//       // אם השרת החזיר 400 (למשל, מצא רטיבות), נחזיר את ההודעה היפה שהוא ייצר
//       return { isValid: false, reason: data.error || 'המערכת זיהתה פערים בתמונה.' };
//     }
//   } catch (error) {
//     console.error("Server connection error:", error);
//     return { isValid: false, reason: 'שגיאת תקשורת עם השרת. ודא ששרת ה-Node פועל ברקע.' };
//   }
// };

// export default function InsuranceUploadApp() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [isUploading, setIsUploading] = useState<boolean>(false);
//   const [showCamera, setShowCamera] = useState<boolean>(false);


//   // === השורה החדשה שנוספה: ===
//   const [hasStarted, setHasStarted] = useState<boolean>(false);


//   // === the new state for managing pages ===
//   const [currentIndex, setCurrentIndex] = useState<number>(0);

//   // === Premium Interactive Features ===
//   const [isHovering, setIsHovering] = useState<string | null>(null);
//   const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

//   // === Sound Effects ===
//   const playSound = (type: 'click' | 'success' | 'error' | 'upload') => {
//     if (!soundEnabled) return;

//     const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
//     const oscillator = audioContext.createOscillator();
//     const gainNode = audioContext.createGain();

//     oscillator.connect(gainNode);
//     gainNode.connect(audioContext.destination);

//     switch (type) {
//       case 'click':
//         oscillator.frequency.value = 800;
//         gainNode.gain.value = 0.1;
//         break;
//       case 'success':
//         oscillator.frequency.value = 1200;
//         gainNode.gain.value = 0.15;
//         break;
//       case 'error':
//         oscillator.frequency.value = 300;
//         gainNode.gain.value = 0.1;
//         break;
//       case 'upload':
//         oscillator.frequency.value = 1000;
//         gainNode.gain.value = 0.12;
//         break;
//     }

//     oscillator.start();
//     oscillator.stop(audioContext.currentTime + 0.1);
//   };

//   useEffect(() => {
//     const buildTasks = () => {
//       const data = (myData as SessionData).property_characteristics;
//       // שליפת הנתונים הרלוונטיים מה-JSON
//       const { rooms, has_balcony, has_storage_room } = data;

//       let newTasks: Task[] = [
//         { id: 'living_room', name: 'סלון', status: 'pending', file: null },
//         { id: 'kitchen', name: 'מטבח', status: 'pending', file: null }
//       ];

//       // הוספת חדרי שינה
//       const bedroomsCount = Math.floor(rooms - 1);
//       for (let i = 1; i <= bedroomsCount; i++) {
//         newTasks.push({ id: `bedroom_${i}`, name: `חדר שינה ${i}`, status: 'pending', file: null });
//       }

//       // בדיקה אם יש חצי חדר (למשל 3.5 חדרים)
//       if (rooms % 1 !== 0) {
//         newTasks.push({ id: 'half_room', name: 'חצי חדר', status: 'pending', file: null });
//       }

//       // הוספת מרפסת אם קיים בנתונים
//       if (has_balcony) {
//         newTasks.push({ id: 'balcony', name: 'מרפסת', status: 'pending', file: null });
//       }

//       // הוספת מחסן אם קיים בנתונים
//       if (has_storage_room) {
//         newTasks.push({ id: 'storage', name: 'מחסן', status: 'pending', file: null });
//       }

//       setTasks(newTasks);
//     };

//     buildTasks();
//   }, []);

//   const handlePhotoCaptured = async (taskId: string, file: File) => {
//     // 1. מיד סוגרים את המצלמה כדי שהמשתמש יחזור למסך הראשי
//     setShowCamera(false);

//     const previewUrl = URL.createObjectURL(file);

//     // 2. מיד!! מעדכנים את המסך כדי להראות ספינר של "מנתח..."
//     // כך המשתמש רואה שמשהו קורה ולא חושב שהאפליקציה נתקעה
//     setTasks(prev => prev.map(t =>
//       t.id === taskId ? { ...t, status: 'analyzing', file, previewUrl, aiFeedback: undefined } : t
//     ));

//     // 3. עכשיו אפשר לבצע את הבדיקה הכבדה של OpenCV ברקע
//     const blurCheck = await checkIsBlurry(file);

//     if (blurCheck.isBlurry) {
//       // אם מטושטש, משנים את הסטטוס לדחייה
//       setTasks(prev => prev.map(t =>
//         t.id === taskId ? {
//           ...t,
//           status: 'rejected',
//           aiFeedback: `התמונה יצאה מטושטשת מדי (ציון: ${Math.round(blurCheck.score)}). אנא צלם שוב.`
//         } : t
//       ));
//       return; // עוצרים כאן ולא שולחים לשרת
//     }

//     // 4. התמונה חדה? ממשיכים לשלוח לשרת (או לסימולציה)
//     const taskName = tasks.find(t => t.id === taskId)?.name || '';
//     const result = await analyzeImageInServer(file, taskName);

//     if (result.isValid) {
//       // משנים סטטוס להצלחה, אבל לא עוברים אוטומטית!
//       setTasks(prev => prev.map(t =>
//         t.id === taskId ? { ...t, status: 'uploaded' } : t
//       ));
//     } else {
//       setTasks(prev => prev.map(t =>
//         t.id === taskId ? { ...t, status: 'rejected', aiFeedback: result.reason, allowOverride: true } : t
//       ));
//     }
//   };


//   const handleFileUpload = async (taskId: string, event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const currentTask = tasks.find(t => t.id === taskId);
//     if (!currentTask) return;

//     // יוצרים כתובת תצוגה מקדימה מיד!
//     const previewUrl = URL.createObjectURL(file);

//     // שומרים את הקובץ והכתובת בסטייט כבר בשלב הניתוח
//     setTasks(prev => prev.map(t =>
//       t.id === taskId ? { ...t, status: 'analyzing', file: file, previewUrl: previewUrl, aiFeedback: undefined } : t
//     ));

//     try {
//       const aiResponse = await analyzeImageInServer(file, currentTask.name);

//       if (aiResponse.isValid) {
//         // משנים סטטוס להצלחה ומחכים שהמשתמש ילחץ על הבא
//         setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'uploaded' } : t));
//       } else {
//         setTasks(prev => prev.map(t =>
//           t.id === taskId ? { ...t, status: 'rejected', aiFeedback: aiResponse.reason, allowOverride: true } : t
//         ));
//       }
//     } catch (error) {
//       setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'rejected', aiFeedback: 'שגיאת תקשורת' } : t));
//     }
//   };




//   const forceApproveTask = (taskId: string) => {
//     // רק משנים את הסטטוס להצלחה, כפתור 'הבא' כבר יידלק לבד
//     setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'uploaded' } : t));
//   };

//   const handleSubmit = async () => {
//     setIsUploading(true);
//     setTimeout(() => {
//       alert("כל התמונות הועלו בהצלחה!");
//       setIsUploading(false);
//     }, 2000);
//   };
//   // === מסך הפתיחה ===
//   if (!hasStarted) {
//     return (
//       <div className="app-wrapper" dir="rtl">
//         <div className="modern-card welcome-card">
//           <div className="welcome-icon">👋</div>
//           <h1 className="welcome-title">ברוכים הבאים!</h1>

//           <p className="welcome-text">
//             תהליך אימות הנכס שלכם יוצא לדרך.<br />
//             זהו תהליך דיגיטלי, קצר ופשוט שייקח דקות בודדות בלבד.<br /><br />
//             כל מה שתצטרכו לעשות הוא לצלם מספר תמונות של החדרים בנכס. אנא ודאו שהחדרים מוארים היטב לפני שנתחיל.
//           </p>

//           {/* הכפתור שמשנה את הסטייט ומתחיל את האפליקציה */}
//           <button
//             className="btn primary start-btn"
//             onClick={() => setHasStarted(true)}
//           >
//             הבנתי, בואו נתחיל 🚀
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // === משתני עזר לתצוגה (כבר קיים אצלך) ===
//   if (tasks.length === 0) return <div>טוען נתונים...</div>;
//   // ... המשך הקוד שלך ...
//   // === helper variables for display ===
//   if (tasks.length === 0) return (
//     <div className="app-wrapper" dir="rtl">
//       <div className="modern-card loading-skeleton" style={{ textAlign: 'center', padding: '60px 40px' }}>
//         <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
//         <h2 className="header-title">טוען נתונים</h2>
//         <p className="header-subtitle">מכין עבורך חוויית צילום והעלאה</p>
//       </div>
//     </div>
//   ); // protection before state fills

//   const currentTask = tasks[currentIndex];
//   const allCompleted = tasks.every(task => task.status === 'uploaded');
//   const progressPercentage = ((currentIndex + 1) / tasks.length) * 100;

//   // return (
//   //   <div className="app-wrapper" dir="rtl">
//   //     <div className="modern-card">
//   //     {/* === sound toggle button === */}
//   //     <button
//   //       className="btn secondary icon-btn"
//   //       onClick={() => setSoundEnabled(!soundEnabled)}
//   //       style={{
//   //         position: 'absolute',
//   //         top: '20px',
//   //         right: '20px',
//   //         zIndex: 2
//   //       }}
//   //       title={soundEnabled ? 'כבה צלילים' : 'הפעל צלילים'}
//   //     >
//   //       {soundEnabled ? '🔊' : '🔇'}
//   //     </button>

//   //     {/* === the camera addition === */}
//   //     {showCamera && (
//   //       <CameraCapture
//   //         onCapture={(file) => handlePhotoCaptured(currentTask.id, file)}
//   //         onCancel={() => setShowCamera(false)}
//   //       />
//   //     )}

//   //     {/* progress bar */}
//   //     <div className="progress-container">
//   //       <div className="progress-text">
//   //         <span>משימה {currentIndex + 1} מתוך {tasks.length}</span>
//   //         <span>{Math.round(progressPercentage)}%</span>
//   //       </div>
//   //       <div className="progress-track">
//   //         <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
//   //       </div>
//   //     </div>

//   //     <header style={{ textAlign: 'center', marginBottom: '30px' }}>
//   //       <h2 className="header-title">צלם את ה{currentTask.name}</h2>
//   //       <p className="header-subtitle">אנא ודא שהחלל מואר היטב וברור בתמונה.</p>
//   //     </header>

//   //     {/* === the main task display === */}
//   //     <div className={`task-area ${currentTask.status === 'uploaded' ? 'success-state' : ''}`}>

//   //       {/* תצוגת תמונה (מופיעה כשיש תמונה - בניתוח, הצלחה או דחייה) */}
//   //       {currentTask.previewUrl && (
//   //         <div className="preview-image-container">
//   //           <img
//   //             src={currentTask.previewUrl}
//   //             alt="תצוגה מקדימה"
//   //             className="preview-image"
//   //             style={{ opacity: currentTask.status === 'analyzing' ? 0.6 : 1 }}
//   //           />

//   //           {/* אנימציית סריקה בזמן ניתוח */}
//   //           {currentTask.status === 'analyzing' && (
//   //             <div className="analyzing-badge">
//   //               <span className="spin-icon">🤖</span> מנתח...
//   //             </div>
//   //           )}
//   //         </div>
//   //       )}

//   //       {/* טקסט סטטוס: אומת */}
//   //       {/* טקסט סטטוס: אומת + כפתור החלפה */}
//   //       {currentTask.status === 'uploaded' && (
//   //         <div style={{ width: '100%' }}>
//   //           <div style={{
//   //             color: '#16a34a',
//   //             fontSize: '18px',
//   //             fontWeight: 'bold',
//   //             display: 'flex',
//   //             alignItems: 'center',
//   //             justifyContent: 'center',
//   //             gap: '8px',
//   //             marginBottom: '15px'
//   //           }}>
//   //             <span>✅</span> התמונה אומתה בהצלחה!
//   //           </div>

//   //           {/* replace image button */}
//   //           <button
//   //             className="btn secondary"
//   //             onClick={() => {
//   //               playSound('click');
//   //               setTasks(prev => prev.map(t =>
//   //                 t.id === currentTask.id ? { ...t, status: 'pending', file: null, previewUrl: undefined } : t
//   //               ));
//   //             }}
//   //             onMouseEnter={() => setIsHovering('replace')}
//   //             onMouseLeave={() => setIsHovering(null)}
//   //           >
//   //             🔄 החלף תמונה
//   //             {isHovering === 'replace' && <span style={{ marginLeft: '5px' }}>{'...'}</span>}
//   //           </button>
//   //         </div>
//   //       )}

//   //       {/* מצב: ממתין או נדחה - כפתורי פעולה */}
//   //       {(currentTask.status === 'pending' || currentTask.status === 'rejected') && (
//   //         <>
//   //           {!currentTask.previewUrl && <div style={{ fontSize: '48px', marginBottom: '15px' }}>📸</div>}

//   //           <div className="task-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
//   //             <button
//   //               className={`btn ${currentTask.status === 'rejected' ? 'danger' : 'primary'}`}
//   //               onClick={() => setShowCamera(true)}
//   //             >
//   //               {currentTask.status === 'rejected' ? 'צלם מחדש' : 'פתח מצלמה'}
//   //             </button>

//   //             <label htmlFor={`file-${currentTask.id}`} className="btn secondary">
//   //               הגלריה
//   //               <input type="file" accept="image/*" id={`file-${currentTask.id}`} style={{ display: 'none' }} onChange={(e) => handleFileUpload(currentTask.id, e)} />
//   //             </label>
//   //           </div>
//   //         </>
//   //       )}

//   //       {/* הודעת שגיאה וכפתור עקיפה */}
//   //       {currentTask.status === 'rejected' && (
//   //         <div className="error-box">
//   //           <strong>זיהינו בעיה:</strong> {currentTask.aiFeedback}
//   //           {currentTask.allowOverride && (
//   //             <button 
//   //               className="btn secondary"
//   //               onClick={() => forceApproveTask(currentTask.id)}
//   //               style={{ marginTop: '10px', width: '100%', borderColor: '#991b1b', color: '#991b1b' }}
//   //             >
//   //               התמונה תקינה, המשך בכל זאת
//   //             </button>
//   //           )}
//   //         </div>
//   //       )}
//   //     </div>

//   //     {/* bottom navigation buttons */}
//   //     <div className="bottom-nav">
//   //       <button
//   //         className="btn secondary"
//   //         onClick={() => {
//   //           playSound('click');
//   //           setCurrentIndex(prev => Math.max(0, prev - 1));
//   //         }}
//   //         disabled={currentIndex === 0 || currentTask.status === 'analyzing'}
//   //         onMouseEnter={() => setIsHovering('prev')}
//   //         onMouseLeave={() => setIsHovering(null)}
//   //       >
//   //         הקודם
//   //         {isHovering === 'prev' && <span style={{ marginLeft: '5px' }}>{'<'}</span>}
//   //       </button>

//   //       {currentIndex < tasks.length - 1 ? (
//   //         <Button
//   //           variant="primary"
//   //           onClick={() => {
//   //             playSound('success');
//   //             setCurrentIndex(prev => prev + 1);
//   //           }}
//   //           disabled={currentTask.status !== 'uploaded'}
//   //           onMouseEnter={() => setIsHovering('next')}
//   //           onMouseLeave={() => setIsHovering(null)}
//   //         >
//   //           הבא
//   //           {isHovering === 'next' && <span style={{ marginLeft: '5px' }}>{'>'}</span>}
//   //         </Button>
//   //       ) : (
//   //         <button
//   //           className={`btn ${allCompleted ? 'success-btn' : 'secondary'}`}
//   //           onClick={() => {
//   //             playSound('success');
//   //             handleSubmit();
//   //           }}
//   //           disabled={!allCompleted || isUploading}
//   //           onMouseEnter={() => setIsHovering('finish')}
//   //           onMouseLeave={() => setIsHovering(null)}
//   //         >
//   //           {isUploading ? 'שולח...' : 'סיום ושליחה'}
//   //           {isHovering === 'finish' && <span style={{ marginLeft: '5px' }}>{'>>>'}</span>}
//   //         </button>
//   //       )}
//   //     </div>
//   //     </div>
//   //   </div>
//   // );



//   return (
//     <div className="app-wrapper" dir="rtl">
//       <div className="modern-card">

//         {showCamera && (
//           <CameraCapture
//             onCapture={(file) => handlePhotoCaptured(currentTask.id, file)}
//             onCancel={() => setShowCamera(false)}
//           />
//         )}

//         {/* סרגל התקדמות */}
//         <div className="progress-container">
//           <div className="progress-text">
//             <span>משימה {currentIndex + 1} מתוך {tasks.length}</span>
//             <span>{Math.round(progressPercentage)}%</span>
//           </div>
//           <div className="progress-track">
//             <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
//           </div>
//         </div>

//         <header style={{ textAlign: 'center', marginBottom: '30px' }}>
//           <h2 className="header-title">צלם את ה{currentTask.name}</h2>
//           <p className="header-subtitle">אנא ודא שהחלל מואר היטב וברור בתמונה.</p>
//         </header>

//         {/* תצוגת המשימה המרכזית */}
//         <div className={`task-area ${currentTask.status === 'uploaded' ? 'success-state' : ''}`}>

//           {currentTask.previewUrl && (
//             <div className="preview-image-container">
//               <img
//                 src={currentTask.previewUrl}
//                 alt="תצוגה מקדימה"
//                 className="preview-image"
//                 style={{ opacity: currentTask.status === 'analyzing' ? 0.6 : 1 }}
//               />
//               {currentTask.status === 'analyzing' && (
//                 <div className="analyzing-badge">
//                   <span className="spin-icon">🤖</span> מנתח...
//                 </div>
//               )}
//             </div>
//           )}

//           {currentTask.status === 'uploaded' && (
//             <div style={{ width: '100%' }}>
//               <div style={{ color: '#16a34a', fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>
//                 <span>✅</span> התמונה אומתה בהצלחה!
//               </div>
//               <button
//                 className="btn secondary"
//                 onClick={() => setTasks(prev => prev.map(t =>
//                   t.id === currentTask.id ? { ...t, status: 'pending', file: null, previewUrl: undefined } : t
//                 ))}
//               >
//                 🔄 צלם שוב
//               </button>
//             </div>
//           )}

//           {(currentTask.status === 'pending' || currentTask.status === 'rejected') && (
//             <>
//               {!currentTask.previewUrl && <div style={{ fontSize: '56px', marginBottom: '20px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>📸</div>}

//               <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
//                 <button
//                   className={`btn ${currentTask.status === 'rejected' ? 'danger' : 'primary'}`}
//                   style={{ flex: 1, minWidth: '140px' }}
//                   onClick={() => setShowCamera(true)}
//                 >
//                   {currentTask.status === 'rejected' ? 'צלם מחדש' : 'פתח מצלמה'}
//                 </button>

//                 <label htmlFor={`file-${currentTask.id}`} className="btn secondary" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
//                   הגלריה
//                   <input type="file" accept="image/*" id={`file-${currentTask.id}`} style={{ display: 'none' }} onChange={(e) => handleFileUpload(currentTask.id, e)} />
//                 </label>
//               </div>
//             </>
//           )}

//           {currentTask.status === 'rejected' && (
//             <div className="error-box">
//               <strong>זיהינו בעיה:</strong> {currentTask.aiFeedback}
//               {currentTask.allowOverride && (
//                 <button
//                   onClick={() => forceApproveTask(currentTask.id)}
//                   className="btn secondary"
//                   style={{ marginTop: '15px', width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
//                 >
//                   התמונה תקינה, המשך בכל זאת
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* כפתורי ניווט תחתונים */}
//         <div className="bottom-nav">
//           <button
//             className="btn secondary"
//             onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
//             disabled={currentIndex === 0 || currentTask.status === 'analyzing'}
//           >
//             הקודם
//           </button>

//           {currentIndex < tasks.length - 1 ? (
//             <Button
//               variant="primary"
//               onClick={() => setCurrentIndex(prev => prev + 1)}
//               disabled={currentTask.status !== 'uploaded'}
//             >
//               הבא
//             </Button>
//           ) : (
//             <button
//               className={`btn ${allCompleted ? 'success-btn' : 'secondary'}`}
//               onClick={handleSubmit}
//               disabled={!allCompleted || isUploading}
//             >
//               {isUploading ? 'שולח...' : 'סיום ושליחה'}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );




// }


































import React, { useState, useEffect, ChangeEvent } from 'react';
import myData from '../data.json';
import CameraCapture from './CameraCapture';
import Button from './Button';
import './iii.css';

// === Types ===
interface PropertyCharacteristics {
  area_sqm: number;
  rooms: number;
  bathrooms: number;
  has_balcony: boolean;
  balcony_area_sqm: number;
  has_storage_room: boolean;
  has_parking: boolean;
  declared_finish_level: string;
  toilets_count?: number;
}

interface SessionData {
  session_id: string;
  timestamp: string;
  customer_details: any;
  property_details: any;
  property_characteristics: PropertyCharacteristics;
  security_and_safety: any;
  requested_coverage: any;
  underwriting_questions: any;
  pricing_result: any;
}

type TaskStatus = 'pending' | 'analyzing' | 'uploaded' | 'rejected';

interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  file: File | null;
  previewUrl?: string;
  aiFeedback?: string;
  allowOverride?: boolean;
}

// === Blur Detection ===
const checkIsBlurry = async (file: File): Promise<{ isBlurry: boolean; score: number }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = () => {
        // @ts-ignore
        const cv = window.cv;
        if (!cv) return resolve({ isBlurry: false, score: 0 });
        let src = cv.imread(img);
        let gray = new cv.Mat();
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        let laplacian = new cv.Mat();
        cv.Laplacian(gray, laplacian, cv.CV_64F);
        let mean = new cv.Mat();
        let stddev = new cv.Mat();
        cv.meanStdDev(laplacian, mean, stddev);
        const score = stddev.data64F[0] * stddev.data64F[0];
        src.delete(); gray.delete(); laplacian.delete(); mean.delete(); stddev.delete();
        resolve({ isBlurry: score < 50, score });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// === AI Server Call ===
const analyzeImageInServer = async (file: File, expectedRoom: string): Promise<{ isValid: boolean; reason?: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('taskId', expectedRoom);
  try {
    const response = await fetch('http://localhost:3001/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    if (response.ok && data.success) return { isValid: true };
    return { isValid: false, reason: data.error || 'המערכת זיהתה פערים בתמונה.' };
  } catch {
    return { isValid: false, reason: 'שגיאת תקשורת עם השרת.' };
  }
};

// ─── Step Dots ───
function StepDots({ tasks, currentIndex }: { tasks: Task[]; currentIndex: number }) {
  // Show max 9 dots; if more tasks, skip rendering
  if (tasks.length > 9) return null;
  return (
    <div className="step-dots">
      {tasks.map((task, i) => (
        <div
          key={task.id}
          className={`step-dot ${i === currentIndex ? 'active' : ''} ${task.status === 'uploaded' ? 'done' : ''}`}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───
export default function InsuranceUploadApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const data = (myData as SessionData).property_characteristics;
    const { rooms, has_balcony, has_storage_room } = data;
    let newTasks: Task[] = [
      { id: 'living_room', name: 'סלון', status: 'pending', file: null },
      { id: 'kitchen', name: 'מטבח', status: 'pending', file: null },
    ];
    const bedroomsCount = Math.floor(rooms - 1);
    for (let i = 1; i <= bedroomsCount; i++) {
      newTasks.push({ id: `bedroom_${i}`, name: `חדר שינה ${i}`, status: 'pending', file: null });
    }
    if (rooms % 1 !== 0) {
      newTasks.push({ id: 'half_room', name: 'חצי חדר', status: 'pending', file: null });
    }
    if (has_balcony) newTasks.push({ id: 'balcony', name: 'מרפסת', status: 'pending', file: null });
    if (has_storage_room) newTasks.push({ id: 'storage', name: 'מחסן', status: 'pending', file: null });
    setTasks(newTasks);
  }, []);

  const handlePhotoCaptured = async (taskId: string, file: File) => {
    setShowCamera(false);
    const previewUrl = URL.createObjectURL(file);
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'analyzing', file, previewUrl, aiFeedback: undefined } : t
    ));
    const blurCheck = await checkIsBlurry(file);
    if (blurCheck.isBlurry) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'rejected', aiFeedback: `התמונה מטושטשת מדי (ציון: ${Math.round(blurCheck.score)}). אנא צלם שוב.` } : t
      ));
      return;
    }
    const taskName = tasks.find(t => t.id === taskId)?.name || '';
    const result = await analyzeImageInServer(file, taskName);
    if (result.isValid) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'uploaded' } : t));
    } else {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'rejected', aiFeedback: result.reason, allowOverride: true } : t
      ));
    }
  };

  const handleFileUpload = async (taskId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) return;
    const previewUrl = URL.createObjectURL(file);
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'analyzing', file, previewUrl, aiFeedback: undefined } : t
    ));
    try {
      const aiResponse = await analyzeImageInServer(file, currentTask.name);
      if (aiResponse.isValid) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'uploaded' } : t));
      } else {
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'rejected', aiFeedback: aiResponse.reason, allowOverride: true } : t
        ));
      }
    } catch {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'rejected', aiFeedback: 'שגיאת תקשורת' } : t
      ));
    }
  };

  const forceApproveTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'uploaded' } : t));
  };

  const resetTask = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'pending', file: null, previewUrl: undefined, aiFeedback: undefined } : t
    ));
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    setTimeout(() => {
      alert('כל התמונות הועלו בהצלחה!');
      setIsUploading(false);
    }, 2000);
  };

  // ─── Welcome Screen ───
  if (!hasStarted) {
    return (
      <div className="app-wrapper" dir="rtl">
        <div className="modern-card welcome-card">

          {/* Brand */}
          <div className="brand-bar" style={{ justifyContent: 'center', paddingBottom: 0, marginBottom: 24 }}>
            <div className="brand-logo">
              <img className="brand-logo-img" src="/bituach-yashir-logo.png" alt="ביטוח ישיר" />
            </div>
          </div>

          <div className="welcome-badge">
            <span>●</span>
            <span>אימות נכס דיגיטלי</span>
          </div>

          <div className="welcome-icon">🏠</div>

          <h1 className="welcome-title">נאמת את הנכס<br />שלכם תוך דקות</h1>

          <p className="welcome-text">
            תהליך פשוט ואוטומטי — כל מה שנדרש הוא לצלם כמה תמונות של החדרים.
            הבינה המלאכותית שלנו תטפל בשאר.
          </p>

          <div className="welcome-features">
            <span className="welcome-feature-pill">⚡ מהיר</span>
            <span className="welcome-feature-pill">🤖 AI מאומת</span>
            <span className="welcome-feature-pill">🔒 מאובטח</span>
          </div>

          <button
            className="btn primary start-btn"
            onClick={() => setHasStarted(true)}
          >
            בואו נתחיל 🚀
          </button>
        </div>
      </div>
    );
  }

  // ─── Loading ───
  if (tasks.length === 0) {
    return (
      <div className="app-wrapper" dir="rtl">
        <div className="loading-skeleton">
          <div className="loading-dot-wrap">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
          <span style={{ color: 'var(--text-400)', fontSize: 14 }}>טוען נתונים...</span>
        </div>
      </div>
    );
  }

  const currentTask = tasks[currentIndex];
  const allCompleted = tasks.every(t => t.status === 'uploaded');
  const progressPercentage = ((currentIndex + 1) / tasks.length) * 100;

  // ─── Main App ───
  return (
    <div className="app-wrapper" dir="rtl">
      <div className="modern-card">
        {showCamera && (
          <CameraCapture
            onCapture={(file) => handlePhotoCaptured(currentTask.id, file)}
            onCancel={() => setShowCamera(false)}
          />
        )}

        <div className="card-inner">

          {/* Brand bar */}
          <div className="brand-bar">
            <div className="brand-logo">
              <img className="brand-logo-img" src="/bituach-yashir-logo.png" alt="ביטוח ישיר" />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-400)', fontWeight: 500 }}>
              אימות נכס
            </span>
          </div>

          {/* Progress */}
          <div className="progress-container">
            <div className="progress-text">
              <span>שלב {currentIndex + 1} מתוך {tasks.length}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          {/* Step dots */}
          <StepDots tasks={tasks} currentIndex={currentIndex} />

          {/* Header */}
          <header>
            <h2 className="header-title">
              {currentTask.status === 'uploaded' ? '✅' : '📸'} {currentTask.name}
            </h2>
            <p className="header-subtitle">
              {currentTask.status === 'uploaded'
                ? 'התמונה אומתה — תוכלו להמשיך לשלב הבא'
                : 'ודאו שהחלל מואר היטב לפני הצילום'}
            </p>
          </header>

          {/* Task Area */}
          <div className={`task-area ${currentTask.status === 'uploaded' ? 'success-state' : ''}`}>

            {/* Image preview */}
            {currentTask.previewUrl && (
              <div className="preview-image-container">
                <img
                  src={currentTask.previewUrl}
                  alt="תצוגה מקדימה"
                  className="preview-image"
                  style={{ opacity: currentTask.status === 'analyzing' ? 0.5 : 1 }}
                />
                {currentTask.status === 'analyzing' && (
                  <div className="analyzing-badge">
                    <div className="analyzing-spinner" />
                    <span>מנתח תמונה...</span>
                  </div>
                )}
              </div>
            )}

            {/* Success state */}
            {currentTask.status === 'uploaded' && (
              <div className="success-content">
                {!currentTask.previewUrl && (
                  <div className="success-icon-wrap">✅</div>
                )}
                <span className="success-label">התמונה אומתה בהצלחה!</span>
                <button className="btn retake-btn" onClick={() => resetTask(currentTask.id)}>
                  🔄 צלם מחדש
                </button>
              </div>
            )}

            {/* Pending / Rejected - no preview */}
            {(currentTask.status === 'pending' || currentTask.status === 'rejected') && !currentTask.previewUrl && (
              <div className="camera-placeholder">
                <div className="camera-icon-wrap">📸</div>
              </div>
            )}

            {/* Action buttons */}
            {(currentTask.status === 'pending' || currentTask.status === 'rejected') && (
              <div className="task-actions" style={{ marginTop: currentTask.previewUrl ? 16 : 20 }}>
                <button
                  className={`btn ${currentTask.status === 'rejected' ? 'danger' : 'primary'}`}
                  onClick={() => setShowCamera(true)}
                >
                  {currentTask.status === 'rejected' ? '📷 צלם מחדש' : '📷 פתח מצלמה'}
                </button>

                <label htmlFor={`file-${currentTask.id}`} className="btn secondary" style={{ margin: 0 }}>
                  🖼️ גלריה
                  <input
                    type="file"
                    accept="image/*"
                    id={`file-${currentTask.id}`}
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(currentTask.id, e)}
                  />
                </label>
              </div>
            )}

            {/* Error box */}
            {currentTask.status === 'rejected' && currentTask.aiFeedback && (
              <div className="error-box">
                <strong>זיהינו בעיה</strong>
                {currentTask.aiFeedback}
                {currentTask.allowOverride && (
                  <button
                    className="btn override-btn"
                    onClick={() => forceApproveTask(currentTask.id)}
                  >
                    התמונה תקינה, המשך בכל זאת
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom navigation */}
          <div className="bottom-nav">
            <button
              className="btn secondary"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0 || currentTask.status === 'analyzing'}
            >
              ← הקודם
            </button>

            {currentIndex < tasks.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                disabled={currentTask.status !== 'uploaded'}
              >
                הבא →
              </Button>
            ) : (
              <button
                className={`btn ${allCompleted ? 'success-btn' : 'secondary'}`}
                onClick={handleSubmit}
                disabled={!allCompleted || isUploading}
              >
                {isUploading ? '⏳ שולח...' : '✅ סיום ושליחה'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
