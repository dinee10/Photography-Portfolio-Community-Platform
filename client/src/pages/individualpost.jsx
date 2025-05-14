import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { ChevronLeft } from "lucide-react";

export default function IndividualPost() {
  const { id } = useParams();
  const [post, setPost] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [follows, setFollows] = useState(0); // New state for follows
  const [hasFollowed, setHasFollowed] = useState(false); // New state for follow status
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No post ID provided");
      setLoading(false);
      return;
    }

    // Load likes, follows, comments, and follow status from localStorage
    const storedLikes = localStorage.getItem(`likes_${id}`);
    const storedHasLiked = localStorage.getItem(`hasLiked_${id}`);
    const storedFollows = localStorage.getItem(`follows_${id}`);
    const storedHasFollowed = localStorage.getItem(`hasFollowed_${id}`);
    const storedComments = localStorage.getItem(`comments_${id}`);

    if (storedLikes) setLikes(parseInt(storedLikes, 10));
    if (storedHasLiked) setHasLiked(storedHasLiked === "true");
    if (storedFollows) setFollows(parseInt(storedFollows, 10));
    if (storedHasFollowed) setHasFollowed(storedHasFollowed === "true");
    if (storedComments) setComments(JSON.parse(storedComments));

    // Fetch post data
    setLoading(true);
    axios
      .get(`http://localhost:8080/post/${id}`)
      .then((res) => {
        console.log("Post data fetched:", res.data);
        setPost(res.data || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching post:", err);
        setError("Failed to fetch post. Please check the server or try again later.");
        setLoading(false);
      });
  }, [id]);

  const addNotification = (action) => {
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    const newNotification = {
      postId: id,
      postName: post.name || "Untitled Post",
      action,
      timestamp: new Date().toLocaleString(),
    };
    notifications.push(newNotification);
    localStorage.setItem("notifications", JSON.stringify(notifications));
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
      localStorage.setItem(`likes_${id}`, (likes - 1).toString());
      localStorage.setItem(`hasLiked_${id}`, "false");
      addNotification("unliked");
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
      localStorage.setItem(`likes_${id}`, (likes + 1).toString());
      localStorage.setItem(`hasLiked_${id}`, "true");
      addNotification("liked");
    }
  };

  const handleFollow = () => {
    if (hasFollowed) {
      setFollows(follows - 1);
      setHasFollowed(false);
      localStorage.setItem(`follows_${id}`, (follows - 1).toString());
      localStorage.setItem(`hasFollowed_${id}`, "false");
      addNotification("unfollowed");
    } else {
      setFollows(follows + 1);
      setHasFollowed(true);
      localStorage.setItem(`follows_${id}`, (follows + 1).toString());
      localStorage.setItem(`hasFollowed_${id}`, "true");
      addNotification("followed");
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        text: comment,
        author: "Anonymous",
        date: new Date().toLocaleString(),
      };
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      setComment("");
      localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));
      addNotification("commented");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleUpdateComment = (e) => {
    e.preventDefault();
    if (editCommentText.trim()) {
      const updatedComments = comments.map((c) =>
        c.id === editingCommentId ? { ...c, text: editCommentText, date: new Date().toLocaleString() } : c
      );
      setComments(updatedComments);
      setEditingCommentId(null);
      setEditCommentText("");
      localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));
      addNotification("updated comment");
    }
  };

  const handleDeleteComment = (commentId) => {
    const updatedComments = comments.filter((c) => c.id !== commentId);
    setComments(updatedComments);
    localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));
    addNotification("deleted comment");
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-3xl mx-auto mt-10 pt-20 px-4 text-center">
          <p className="text-gray-600 text-lg">Loading post...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-3xl mx-auto mt-10 pt-20 px-4 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <div className="pb-10">
        <Navbar />
      </div>
      <div className="max-w-3xl mx-auto mt-6 md:mt-10 pt-20 px-4">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="mr-1" size={20} />
          Back to all posts
        </button>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {post.image && (
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img
                src={`http://localhost:8080/post/image/${post.image}`}
                alt={post.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "https://via.placeholder.com/600x400")}
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                  {post.status || 'General'}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {post.name || "Untitled Post"}
                </h1>
              </div>
            </div>

            <div className="flex items-center text-gray-500 text-sm mb-6">
              <span>Posted by {post.author || 'Unknown'} on {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {post.description || "No content available"}
              </p>
            </div>

            {post.topic && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Topic</h3>
                <p className="text-gray-700">{post.topic}</p>
              </div>
            )}

            {post.tag && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tag.split(',').map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleLike}
                className={`${
                  hasLiked ? "bg-blue-700" : "bg-blue-500"
                } hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300`}
              >
                {hasLiked ? "Unlike" : "Like"} ({likes})
              </button>
              <button
                onClick={handleFollow}
                className={`${
                  hasFollowed ? "bg-gray-700" : "bg-gray-500"
                } hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300`}
              >
                {hasFollowed ? "Unfollow" : "Follow"} ({follows})
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments</h3>
              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-100 p-3 rounded-lg">
                    {editingCommentId === comment.id ? (
                      <form onSubmit={handleUpdateComment} className="mb-2">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full p-2 border rounded-lg mb-2"
                        />
                        <button
                          type="submit"
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-full transition duration-300 mr-2"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCommentId(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-full transition duration-300"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <p className="text-gray-700">{comment.text}</p>
                        <p className="text-sm text-gray-500">
                          By {comment.author} on {comment.date}
                        </p>
                        <div className="mt-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-blue-500 hover:underline mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommentSubmit} className="mt-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded-lg mb-2"
                />
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}