import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import logo from "../../assets/Dinitha/logo3.png"; // Your logo path

export default function IndividualBlog() {
  const { id } = useParams();
  const [blog, setBlog] = useState({});
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if speech is active
  const [isPaused, setIsPaused] = useState(false); // Track if speech is paused

  useEffect(() => {
    if (!id) {
      setError("No blog ID provided");
      return;
    }
    axios
      .get(`http://localhost:8080/blog/get/${id}`)
      .then((res) => {
        console.log("Blog data fetched:", res.data);
        setBlog(res.data);
      })
      .catch((err) => {
        console.error("Error fetching blog:", err);
        setError("Failed to fetch blog. Please try again later.");
      });
  }, [id]);

  // Speech Synthesis Functions
  const startSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support speech synthesis.");
      return;
    }

    if (isSpeaking && !isPaused) {
      return; // Prevent starting new speech while speaking
    }

    const utterance = new SpeechSynthesisUtterance();
    const textToSpeak = `${blog.title || "Untitled Blog"}. Written by ${blog.author || "Unknown Author"}. ${
      blog.content || "No content available"
    }`;
    utterance.text = textToSpeak;
    utterance.lang = "en-US";
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      window.speechSynthesis.cancel(); // Clear the queue
    };

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.cancel(); // Clear any previous speech
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
              setTimeout(attemptLoad, 1000); // Retry after 1 second
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
      // Load logo as base64
      console.log("Attempting to load logo from:", logo);
      const logoBase64 = await loadImageAsBase64(logo);
      console.log("Logo loaded successfully (first 50 chars):", logoBase64.slice(0, 50) + "...");
      doc.addImage(logoBase64, "PNG", 10, 10, 40, 20); // Reduced logo height to 20

      // Add blog metadata
      doc.setFontSize(18);
      const title = blog.title || "Untitled";
      doc.text(title, 10, 40);

      // Add author
      doc.setFontSize(12);
      const author = blog.author || "Unknown Author";
      doc.text(`By: ${author}`, 10, 50);

      // Load and add the blog image if available
      let yPosition = 60;
      if (blog.image) {
        const imageUrl = `http://localhost:8080/blog/uploads/${blog.image}`;
        console.log("Attempting to load blog image from:", imageUrl);
        try {
          const imageBase64 = await loadImageAsBase64(imageUrl);
          console.log("Blog image loaded successfully (first 50 chars):", imageBase64.slice(0, 50) + "...");
          const format = imageBase64.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
          doc.addImage(imageBase64, format, 10, yPosition, 150, 80);
          yPosition += 90;
        } catch (error) {
          console.error("Failed to load blog image:", error);
        }
      }

      // Add content
      addContentToPDF(doc, blog.content || "No content available", title, yPosition);
    } catch (error) {
      console.error("PDF generation failed:", error);
      // Fallback if any image fails
      doc.setFontSize(18);
      doc.text(blog.title || "Untitled", 10, 40);
      doc.setFontSize(12);
      doc.text(`By: ${blog.author || "Unknown Author"}`, 10, 50);
      addContentToPDF(doc, blog.content || "No content available", blog.title || "Untitled", 60);
    }
  };

  const addContentToPDF = (doc, content, title, startY) => {
    let yPosition = startY + 10;
    doc.setFontSize(10);
    doc.text("Content:", 10, yPosition);
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

        doc.text("(Content truncated due to single-page limit...)", 10, yPosition + maxLines * 10);
        console.log(`Truncated content: Only ${maxLines} of ${contentLines.length} lines fit.`);
        doc.save(`${title || "Blog"}.pdf`);
        return;
      }
    }

    contentLines.forEach((line, index) => {
      doc.text(line, 10, yPosition + index * 10);
    });

    doc.save(`${title || "Blog"}.pdf`);
  };

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
        <h1 className="text-4xl font-bold text-center mb-8">{blog.title || "Loading..."}</h1>

        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600">
            By <span className="font-semibold">{blog.author || "Unknown Author"}</span>
          </p>
        </div>

        {blog.image && (
          <div className="mb-8">
            <img
              src={`http://localhost:8080/blog/uploads/${blog.image}`}
              alt={blog.title || "Blog image"}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              onError={(e) => (e.target.src = "https://via.placeholder.com/600x400")}
            />
          </div>
        )}

        <div className="bg-gray-100 rounded-lg shadow-lg p-6 mb-8">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{blog.content || "No content available"}</p>
        </div>

        <div className="text-center mb-4 flex justify-center space-x-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={downloadPDF}
          >
            Download Blog as PDF
          </button>
          <button
            className={`${
              isSpeaking && !isPaused ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105`}
            onClick={startSpeech}
            disabled={!blog.title && !blog.content} // Disable if no content
          >
            {isSpeaking && !isPaused ? "Speaking..." : isPaused ? "Resume" : "Listen to Blog"}
          </button>
          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={pauseSpeech}
            disabled={!isSpeaking || isPaused}
          >
            Pause
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={stopSpeech}
            disabled={!isSpeaking}
          >
            Stop
          </button>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}