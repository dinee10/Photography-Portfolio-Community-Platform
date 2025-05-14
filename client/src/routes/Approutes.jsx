
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from '../pages/Home/Register';
import Login from '../pages/Home/Login';
import UserProfile from '../pages/UserProfile/UserProfile';
import UpdateProfile from '../pages/Dasboard/UpdatePDashboard';
import Progress from '../pages/Progress/AddProgress';
import ProgressUpdate from '../pages/Dasboard/UpdateProgressDashboard';
import ProgressList from '../pages/Progress/ProgressList';
import IndividualProgress from '../pages/Progress/IndividualProgress';
import ListProgress from '../pages/Progress/Progress';
import ProgressL from '../pages/Progress/Progress';
import User from '../pages/Dasboard/User';
import About from "../pages/common/About";
import Contact from "../pages/common/Contact";
import Blog from "../pages/Ishanka/AddBlog"
import BlogList from "../pages/Ishanka/BlogList" 
import TourismBlog from "../pages/Ishanka/UserBlog"
import IndividualBlog from "../pages/Ishanka/InduvidualBlog";
import Admin from "../pages/dashboard/Admin";
import UpdateBlogDashboard from "../pages/dashboard/Ishanka dahsbaord/UpdateBlogDashbaord";

const AppRoutes = () => {
  return (
    <div>

<Router>
        <Routes>
        <Route path='/' element={<ProgressList/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/updateprofile/:id' element={<UpdateProfile />} />
          <Route path='/addprogress' element={<Progress />} />
          <Route path='/progresslist' element={<ProgressList />} />
          <Route path='/update/:id' element={<ProgressUpdate />} />
          <Route path='/progress/:id' element={<IndividualProgress />} />
          <Route path='/progress' element={<ListProgress />} />
          <Route path='/progressl' element={<ProgressL />} />
          <Route path='/admin' element={<User />} />
            
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
             <Route path="/add-blog" element={<Blog />} />
                <Route path="/blog-list" element={<BlogList />} />
                <Route path="/update-blog/:id" element={<UpdateBlogDashboard />} />
                <Route path="/user-blog" element={<TourismBlog />} />
                <Route path ="/blog/:id" element = {<IndividualBlog />} />

                <Route 
                    path="/dashboard" 
                    element={
                        //<ProtectedRoute adminOnly>
                            <Admin />
                        //</ProtectedRoute>
                    } 
                />

          </Routes>
</Router>   
    </div>
  )
}

export default AppRoutes

