//import { useState, useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
//import { UserContext } from "../../components/userContext";
import axios from "axios";
//import toast from "react-hot-toast";
//import Users from "./Dinitha/Users"; 
import AddProgress from "../Progress/AddProgress";
import Progress from "../Progress/Progress";
import UserProfile from "../UserProfile/UserProfile";
import Spinner from "../../component/spinner/spinner";

const Admin = () => {
  //const { user, setUser, loading, error } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('Manage Progress');
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 0); 

        return () => clearTimeout(timer);
    }, []);

  /*const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      await axios.post('http://localhost:5000/api/auth/signout', {}, { withCredentials: true });
      
      setUser(null);
      window.location.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };*/

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold bg-gray-900">User Dashboard</div>
        <nav className="flex-1 px-2 py-4">
          {['Manage Progress', 'Add Progress', 'User Profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`block w-full text-left px-4 py-2 rounded ${activeTab === tab ? 'bg-gray-700' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        {/*<div className="p-4">
          <button 
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 w-full rounded hover:bg-red-500"
          >
            Logout
          </button>
        </div>*/}
      </aside>

      
      <main className="flex-1 p-6">
        
        <header className="bg-white shadow p-4 rounded mb-4">
          {/*<h2 className="text-xl font-semibold text-gray-800">Welcome, {user ? user.name : 'Admin'}!</h2>*/}
        </header>

      
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner /> 
          </div>
        ) : (
          <>
            {/*{error && <div className="text-red-600 mb-4">{error}</div>}*/}
            {activeTab === 'Manage Progress' && <Progress />}
            {activeTab === 'Add Progress' && <AddProgress />} 
            {activeTab === 'User Profile' && <UserProfile />} 
            

          </>
        )}
      </main>
    </div>
  );
};

export default User;