import React from 'react';
import Navbar from '../../component/Navbar/Navbar';

const Home = () => {
  return (
    <div>
      <Navbar/>
     
      <button onClick={()=>(window.location.href='/register')}>Register</button>
      <button onClick={()=>(window.location.href='/addprogress')}>Add Progress</button>
    </div>
  )
}

export default Home
