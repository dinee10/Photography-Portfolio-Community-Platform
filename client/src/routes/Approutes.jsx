
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "../pages/common/About";
import Contact from "../pages/common/Contact";
import Blog from "../pages/Ishanka/AddBlog"
import BlogList from "../pages/Ishanka/BlogList" 
import TourismBlog from "../pages/Ishanka/UserBlog"
import IndividualBlog from "../pages/Ishanka/InduvidualBlog";
import Admin from "../pages/dashboard/Admin";
import UpdateBlogDashboard from "../pages/dashboard/Ishanka dahsbaord/UpdateBlogDashbaord";

function AppRoutes() {
    return (
        <Router>
            <Routes>
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
    );
}

export default AppRoutes;
