import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
import './App.css'
import InsuranceUploadApp from './comp';


declare global {
  interface Window {
    cv: any;
  }
}


function App() {
  const [count, setCount] = useState(0)


  return (
    // עטיפת הקומפוננטה ב-div כדי לתת לה מרחב (Padding)
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '20px' }}>

      {/* תצוגת הקומפוננטה על המסך */}
      <InsuranceUploadApp />

    </div>
  );
}

export default App
