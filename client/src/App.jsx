import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Post from './pages/AddPost';
import PostList from './pages/Post';
import PostUpdate from './pages/PostUpdate';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <BrowserRouter>
        <Routes>
          <Route path='/post' element={<Post />} />
          <Route path='/addpost' element={<Post />} />
          <Route path='/postlist' element={<PostList />} />
          <Route path='/update/:id' element={<PostUpdate />} />
          </Routes>
          </BrowserRouter>
      </div>
   
    </>
  )
}

export default App;