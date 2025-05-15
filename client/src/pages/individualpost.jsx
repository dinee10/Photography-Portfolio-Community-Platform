import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { ChevronLeft } from "lucide-react";

export default function IndividualPost() {
  const { id } = useParams();
  const [post, setPost] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [follows, setFollows] = useState(0);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const minDate = new Date('2025-05-15');

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view the post.");
      navigate('/login');
      setLoading(false);
      return;
    }

    if (!id) {
      setError("No post ID provided");
      setLoading(false);
      return;
    }

    // Load likes, follows, comments, and states from localStorage
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

    setLoading(true);
    axios
      .get(`http://localhost:8080/post/${id}`, { params: { userId } })
      .then((res) => {
        console.log("Post data fetched:", res.data);
        const fetchedPost = res.data || {};
        const createdAtDate = fetchedPost.createdAt ? new Date(fetchedPost.createdAt) : null;
        if (createdAtDate && !isNaN(createdAtDate) && createdAtDate < minDate) {
          console.warn("Invalid createdAt date:", fetchedPost.createdAt);
          fetchedPost.createdAt = null;
        }
        const updatedAtDate = fetchedPost.updatedAt ? new Date(fetchedPost.updatedAt) : null;
        if (updatedAtDate && !isNaN(updatedAtDate) && updatedAtDate < minDate) {
          console.warn("Invalid updatedAt date:", fetchedPost.updatedAt);
          fetchedPost.updatedAt = null;
        }
        setPost(fetchedPost);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching post:", err);
        setError(err.response?.data?.message || "Failed to fetch post. Please try again later.");
        setLoading(false);
      });
  }, [id, userId, navigate]);

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
        author: post.user?.fullname || "Anonymous",
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

  const startSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support speech synthesis.");
      return;
    }

    if (isSpeaking && !isPaused) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance();
    const createdDate = post.createdAt
      ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : "Not available";
    const updatedDate = post.updatedAt
      ? new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : "Not available";
    const textToSpeak = `${post.name || "Untitled Post"}. Topic: ${post.topic || "No topic"}. ${
      post.description || "No description available"
    }. Status: ${post.status || "Unknown"}. Tag: ${post.tag || "None"}. Created: ${createdDate}. Updated: ${updatedDate}. Likes: ${likes}. Follows: ${follows}.`;
    utterance.text = textToSpeak;
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      window.speechSynthesis.cancel();
    };

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const pauseSpeech = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const loadImageAsBase64 = (url, maxRetries = 3, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const attemptLoad = () => {
        fetch(url, { mode: "cors" })
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.blob();
          })
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read blob"));
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error(`Image load attempt ${retries + 1} failed for ${url}:`, error);
            if (retries < maxRetries) {
              retries++;
              setTimeout(attemptLoad, 1000);
            } else {
              reject(new Error(`Max retries (${maxRetries}) reached for ${url}`));
            }
          });
      };
      attemptLoad();
      setTimeout(() => reject(new Error(`Timeout after ${timeout}ms for ${url}`)), timeout);
    });
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();

    try {
      doc.setFontSize(18);
      const name = post.name || "Untitled";
      doc.text(name, 10, 40);

      doc.setFontSize(12);
      const topic = post.topic || "No topic";
      doc.text(`Topic: ${topic}`, 10, 50);

      doc.text(`Status: ${post.status || "Unknown"}`, 10, 60);

      doc.text(`Tag: ${post.tag || "None"}`, 10, 70);

      doc.text(`Likes: ${likes}`, 10, 80);

      doc.text(`Follows: ${follows}`, 10, 90);

      const createdDate = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : "Not available";
      doc.text(`Created: ${createdDate}`, 10, 100);

      const updatedDate = post.updatedAt
        ? new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : "Not available";
      doc.text(`Updated: ${updatedDate}`, 10, 110);

      let yPosition = 120;
      if (post.image) {
        const imageUrl = `http://localhost:8080/post/image/${post.image}`;
        try {
          const imageBase64 = await loadImageAsBase64(imageUrl);
          const format = imageBase64.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
          doc.addImage(imageBase64, format, 10, yPosition, 150, 80);
          yPosition += 90;
        } catch (error) {
          console.error("Failed to load post image:", error);
        }
      }

      // Add comments to PDF
      doc.setFontSize(12);
      doc.text("Comments:", 10, yPosition);
      yPosition += 10;
      comments.forEach((comment, index) => {
        const commentText = `${index + 1}. ${comment.author}: ${comment.text} (${comment.date})`;
        const commentLines = doc.splitTextToSize(commentText, 180);
        commentLines.forEach((line) => {
          if (yPosition < 280) {
            doc.text(line, 10, yPosition);
            yPosition += 10;
          }
        });
      });

      addContentToPDF(doc, post.description || "No description available", name, yPosition);
    } catch (error) {
      console.error("PDF generation failed:", error);
      doc.setFontSize(18);
      doc.text(post.name || "Untitled", 10, 40);
      doc.setFontSize(12);
      doc.text(`Topic: ${post.topic || "No topic"}`, 10, 50);
      doc.text(`Status: ${post.status || "Unknown"}`, 10, 60);
      doc.text(`Tag: ${post.tag || "None"}`, 10, 70);
      doc.text(`Likes: ${likes}`, 10, 80);
      doc.text(`Follows: ${follows}`, 10, 90);
      doc.text(
        `Created: ${post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not available"}`,
        10, 100
      );
      doc.text(
        `Updated: ${post.updatedAt ? new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not available"}`,
        10, 110
      );
      addContentToPDF(doc, post.description || "No description available", post.name || "Untitled", 120);
    }
  };

  const addContentToPDF = (doc, content, title, startY) => {
    let yPosition = startY + 10;
    doc.setFontSize(10);
    doc.text("Description:", 10, yPosition);
    yPosition += 10;

    const maxHeight = 280;
    const contentLines = doc.splitTextToSize(content, 180);

    let totalHeightNeeded = yPosition;
    for (let line of contentLines) {
      totalHeightNeeded += 10;
      if (totalHeightNeeded > maxHeight) {
        const availableHeight = maxHeight - yPosition;
        const maxLines = Math.floor(availableHeight / 10);
        const linesToShow = contentLines.slice(0, maxLines);

        linesToShow.forEach((line, index) => {
          doc.text(line, 10, yPosition + index * 10);
        });

        doc.text("(Description truncated due to single-page limit...)", 10, yPosition + maxLines * 10);
        doc.save(`${title || "Post"}.pdf`);
        return;
      }
    }

    contentLines.forEach((line, index) => {
      doc.text(line, 10, yPosition + index * 10);
    });

    doc.save(`${title || "Post"}.pdf`);
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
                alt={post.name || "Post Image"}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "https://via.placeholder.com/600x400")}
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                  {post.status || "General"}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {post.name || "Untitled Post"}
                </h1>
              </div>
            </div>

            <div className="flex items-center text-gray-500 text-sm mb-6">
              <span>
                Posted by {post.user?.fullname || "Unknown"} on{" "}
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not available"}
              </span>
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
                  {post.tag.split(",").map((tag, index) => (
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
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
                onClick={downloadPDF}
              >
                Download Post as PDF
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