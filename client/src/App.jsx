
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Post from './pages/AddPost';
import PostList from './pages/Post';
import PostUpdate from './pages/PostUpdate';
import ListPost from './pages/Postlist'
import Individualpost from './pages/individualpost';




import AppRoutes from './routes/Approutes'

function App() {

  return (

 
   <>
      <div>
  
      <AppRoutes />
   <BrowserRouter>
        <Routes>
          <Route path='/post' element={<Post />} />
          <Route path='/addpost' element={<Post />} />
          <Route path='/postlist' element={<PostList />} />
          <Route path='/update/:id' element={<PostUpdate />} />
          <Route path='/listpost' element={<ListPost />} />
          <Route path='/post/:id'element= {<Individualpost/>}/>
          </Routes>
          </BrowserRouter>
      </div>
   

    </>
  )
}

export default App

