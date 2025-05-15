import { useState } from 'react'
import './App.css';
import Approutes from './routes/Approutes'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
       <Approutes/>
      </div>
     
    </>
  )
}

export default App
