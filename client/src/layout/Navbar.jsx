import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-primary">
    <div className="container-fluid">
      <a className="navbar-brand fw-medium 	text-white"  href="#">Photography Studies<br/> Course</a>
      
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          
        </ul>
      </div>
    </div>
    <Link className="btn btn-outline-light left-10" to='/adduser'>Add New Lessons</Link>


  </nav>
  );
}

export default Navbar;
