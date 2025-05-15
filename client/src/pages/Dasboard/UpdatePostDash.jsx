import { Link, useNavigate } from "react-router-dom";
import back from "../../assets/Back.png";
import PostUpdate from "../PostUpdate";

const AdminUpdateTour = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/postlist");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold bg-gray-900">
          User Dashboard
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
        </nav>
        
        <div className="p-4">
          <button 
            className="bg-red-600 px-4 py-2 w-full rounded hover:bg-red-500"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-100 p-6">
        <header className="bg-white shadow p-4 rounded mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Welcome, User!</h2>
        </header>

        <Link to="/admin">
          <button className="flex items-center text-black font-bold py-2 px-4 rounded hover:bg-blue-600">
            <img src={back} alt="Back Icon" className="w-6 h-6 mr-2" />
            Go Back To Dashboard
          </button>
        </Link>

        <div>
          <PostUpdate />
        </div>
      </main>
    </div>
  );
};

export default AdminUpdateTour;