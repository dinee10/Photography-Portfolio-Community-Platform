import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Home/Register';
import Login from './pages/Home/Login';
import Home from './pages/new/Home';
import UserProfile from './pages/UserProfile/UserProfile';
import UpdateProfile from './pages/UserProfile/UpdateProfile';
import Progress from './pages/Progress/AddProgress';
import ProgressList from './pages/Progress/Progress';
import ProgressUpdate from './pages/Progress/ProgressUpdate';
import Dashboard from './pages/Dasboard/Dashboard';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/updateprofile/:id' element={<UpdateProfile />} />
          <Route path='/addprogress' element={<Progress />} />
          <Route path='/progresslist' element={<ProgressList />} />
          <Route path='/update/:id' element={<ProgressUpdate />} />
          <Route path='/dashboard' element={<Dashboard />} />
          </Routes>
          </BrowserRouter>
      </div>
   
    </>
  )
}

export default App
