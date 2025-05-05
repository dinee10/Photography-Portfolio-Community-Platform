import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function ProgressUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    description: "",
    status: "",
    tag: "",
  });
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    name: "",
    topic: "",
    description: "",
    status: "",
    tag: "",
    file: "",
  });

  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:8080/progress/${id}`)
      .then((res) => {
        setFormData({
          name: res.data.name || "",
          topic: res.data.topic || "",
          description: res.data.description || "",
          status: res.data.status || "",
          tag: res.data.tag || "",
        });
        setExistingImage(res.data.image || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
        Swal.fire({
          title: "Error",
          text: "Failed to load progress data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      const selectedFile = files ? files[0] : null;
      setFile(selectedFile);
      if (selectedFile && !selectedFile.type.startsWith("image/")) {
        setFormErrors({ ...formErrors, file: "File must be an image" });
      } else if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, file: "Image size must not exceed 5MB" });
      } else {
        setFormErrors({ ...formErrors, file: "" });
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleDeleteImage = () => {
    setExistingImage("");
    setFile(null);
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        errors[field] = `${field} is required`;
        isValid = false;
      }
    });

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

    const progressDetails = {
      name: formData.name,
      topic: formData.topic,
      description: formData.description,
      status: formData.status,
      tag: formData.tag,
      updatedAt: new Date().toISOString(),
    };

    const data = new FormData();
    data.append("progress details", JSON.stringify(progressDetails));
    if (file) {
      data.append("file", file);
    }

    try {
      const response = await axios.put(`http://localhost:8080/progress/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire({
        title: "Success",
        text: response.data.message || "Progress updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/admin"));
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      Swal.fire({
        title: "Error",
        text: err.response?.data?.error || "Failed to update progress.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Update Progress</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
            required
          />
          {formErrors.name && <span className="text-red-500 text-sm mt-1 block">{formErrors.name}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.topic ? "border-red-500" : "border-gray-300"}`}
            required
          />
          {formErrors.topic && <span className="text-red-500 text-sm mt-1 block">{formErrors.topic}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.description ? "border-red-500" : "border-gray-300"}`}
            rows="8"
            required
          />
          {formErrors.description && <span className="text-red-500 text-sm mt-1 block">{formErrors.description}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.status ? "border-red-500" : "border-gray-300"}`}
            required
          >
            <option value="">Select Status</option>
            <option value="Started">Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          {formErrors.status && <span className="text-red-500 text-sm mt-1 block">{formErrors.status}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tag</label>
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.tag ? "border-red-500" : "border-gray-300"}`}
            required
          />
          {formErrors.tag && <span className="text-red-500 text-sm mt-1 block">{formErrors.tag}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Image</label>
          <div className="flex gap-4 mt-2 flex-wrap">
            {existingImage ? (
              <div className="relative">
                <img
                  src={`http://localhost:8080/uploads/${existingImage}`}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded-md"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/128")}
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                >
                  X
                </button>
              </div>
            ) : (
              <div>No current image</div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload New Image</label>
          <input
            type="file"
            name="file"
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${formErrors.file ? "border-red-500" : "border-gray-300"}`}
            accept="image/*"
          />
          {formErrors.file && <span className="text-red-500 text-sm mt-1 block">{formErrors.file}</span>}
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Progress"}
          </button>
        </div>
      </form>
    </div>
  );
}