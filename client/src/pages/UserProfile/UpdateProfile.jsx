import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function UpdateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:8080/user/${id}`)
      .then((res) => {
        setFormData({
          fullname: res.data.fullname || "",
          email: res.data.email || "",
          password: res.data.password || "",
          phone: res.data.phone || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
        Swal.fire({
          title: "Error",
          text: "Failed to load user data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.fullname || formData.fullname.trim() === "") {
      errors.fullname = "Fullname is required";
      isValid = false;
    }
    if (!formData.email || formData.email.trim() === "") {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }
    if (!formData.phone || formData.phone.trim() === "") {
      errors.phone = "Phone is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fix the errors in the form before submitting.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/user/${id}`, formData);
      Swal.fire({
        title: "Success",
        text: response.data.message || "User updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/admin"));
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "Failed to update user.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Update Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.fullname ? "border-red-500" : "border-gray-300"}`}
            required
          />
          {formErrors.fullname && <span className="text-red-500 text-sm mt-1 block">{formErrors.fullname}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
            required
          />
          {formErrors.email && <span className="text-red-500 text-sm mt-1 block">{formErrors.email}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.password ? "border-red-500" : "border-gray-300"}`}
              placeholder="Leave blank to keep unchanged"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {formErrors.password && <span className="text-red-500 text-sm mt-1 block">{formErrors.password}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.phone ? "border-red-500" : "border-gray-300"}`}
            required
          />
          {formErrors.phone && <span className="text-red-500 text-sm mt-1 block">{formErrors.phone}</span>}
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
      
    </div>
  );
}