import React from 'react';
import '../App.css';
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import AddUser from '../pages/Learningplan/AddUser';
import EditUser from '../pages/Learningplan/EditUser';
import ViewUser from '../pages/Learningplan/ViewUser';
import Navbar from '../layout/Navbar';
import Home from '../layout/Home';

const Approutes = () => {
  return (
    <div>
        <Router>
      <Navbar/>
      <Routes>
        <Route exact path='/home'element={<Home/>}/>
        <Route exact path='adduser' element={<AddUser/>}/>
        <Route exact path='/edituser/:id'element={<EditUser/>}/>
        <Route exact path='/viewuser/:id' element={<ViewUser />} />

      </Routes>
      

      </Router>
     

        </div>
  )
}

export default Approutes