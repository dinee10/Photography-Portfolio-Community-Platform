import { useState } from 'react'
import AppRoutes from './routes/Approutes'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <AppRoutes />
      </div>
   
    </>
  )
}

export default App
