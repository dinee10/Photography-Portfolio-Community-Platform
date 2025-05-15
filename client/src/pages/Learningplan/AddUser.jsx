import React, { useState } from 'react';
import axios from "axios"
import { Link,useNavigate} from "react-router-dom"

function AddUser() {

    let navigate = useNavigate()


  const [user, setUser] = useState({
    name: '',
    email: '',
    age: '',
    description: ''
  });

  const { name, email, age, description } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSubmit =async (e)=>{
    e.preventDefault();
    await axios.post("http://localhost:8080/api/v1/users", user);

     navigate("/");
  }

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-md-6 offset-md-3 border rounded p-4 mt-2 shadow'>
          <h2 className='text-center m-4'>New Lessons</h2>

           <form onSubmit={(e) => onSubmit(e)}>
          <div className='mb-3'>
            <label htmlFor='name' className='form-label'>Lesson Name</label>
            <input
              type='text'
              className='form-control'
              placeholder='Enter your Subject'
              name='name'
              value={name}
              onChange={onInputChange}
            />
          </div>

                <div className='mb-3'>
        <label htmlFor='email' className='form-label'>Teacher's Email</label>
        <input
            type='email'
            className='form-control'
            placeholder='Enter your Email'
            name='email'
            value={email}
            onChange={onInputChange}
        />
        </div>


          <div className='mb-3'>
            <label htmlFor='age' className='form-label'>Views</label>
            <input
              type='number'
              className='form-control'
              placeholder='Enter your Credit'
              name='age'
              value={age}
              onChange={onInputChange}
            />
          </div>

          <div className='mb-3'>
            <label htmlFor='description' className='form-label'>Video Link</label>
            <input
              type='text'
              className='form-control'
              placeholder='Enter your Description'
              name='description'
              value={description}
              onChange={onInputChange}
            />
          </div>

          <button type='submit' className='btn btn-outline-primary'>Submit</button>
          <Link  className='btn btn-outline-danger mx-2' to="/">Cancel</Link>

          </form>  
        </div>
      </div>
    </div>
  );
}

export default AddUser;
