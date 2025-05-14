import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";

export default function IndividualProgress() {
  const { id } = useParams();
  const [progress, setProgress] = useState({});
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const minDate = new Date('2025-05-14'); // Minimum allowed date (today)

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view progress.");
      navigate('/login');
      return;
    }

    if (!id) {
      setError("No progress ID provided");
      return;
    }

    axios
      .get(`http://localhost:8080/progress/update/${id}`, {
        params: { userId }
      })
      .then((res) => {
        console.log("Progress data fetched:", res.data);
        const fetchedProgress = res.data;
        // Validate createdAt
        const createdAtDate = fetchedProgress.createdAt ? new Date(fetchedProgress.createdAt) : null;
        
        // Validate updatedAt (optional, may be null)
        const updatedAtDate = fetchedProgress.updatedAt ? new Date(fetchedProgress.updatedAt) : null;
        if (updatedAtDate && updatedAtDate < minDate) {
          console.warn("Invalid updatedAt date:", fetchedProgress.updatedAt);
          fetchedProgress.updatedAt = null; // Treat invalid updatedAt as missing
        }
        setProgress(fetchedProgress);
      })
      .catch((err) => {
        console.error("Error fetching progress:", err);
        setError(err.response?.data?.message || "Failed to fetch progress. Please try again later.");
      });
  }, [id, userId, navigate]);

  const startSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Your browser does not support speech synthesis.");
      return;
    }

    if (isSpeaking && !isPaused) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance();
    const createdDate = progress.createdAt
      ? new Date(progress.createdAt).toLocaleDateString()
      : "Not available";
    const updatedDate = progress.updatedAt
      ? new Date(progress.updatedAt).toLocaleDateString()
      : "Not available";
    const textToSpeak = `${progress.name || "Untitled Progress"}. Topic: ${progress.topic || "No topic"}. ${
      progress.description || "No description available"
    }. Status: ${progress.status || "Unknown"}. Tag: ${progress.tag || "None"}. Created: ${createdDate}. Updated: ${updatedDate}.`;
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
      const name = progress.name || "Untitled";
      doc.text(name, 10, 40);

      doc.setFontSize(12);
      const topic = progress.topic || "No topic";
      doc.text(`Topic: ${topic}`, 10, 50);

      doc.text(`Status: ${progress.status || "Unknown"}`, 10, 60);

      doc.text(`Tag: ${progress.tag || "None"}`, 10, 70);

      const createdDate = progress.createdAt
        ? new Date(progress.createdAt).toLocaleDateString()
        : "Not available";
      doc.text(`Created: ${createdDate}`, 10, 80);

      const updatedDate = progress.updatedAt
        ? new Date(progress.updatedAt).toLocaleDateString()
        : "Not available";
      doc.text(`Updated: ${updatedDate}`, 10, 90);

      let yPosition = 100;
      if (progress.image) {
        const imageUrl = `http://localhost:8080/uploads/${progress.image}`;
        try {
          const imageBase64 = await loadImageAsBase64(imageUrl);
          const format = imageBase64.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
          doc.addImage(imageBase64, format, 10, yPosition, 150, 80);
          yPosition += 90;
        } catch (error) {
          console.error("Failed to load progress image:", error);
        }
      }

      addContentToPDF(doc, progress.description || "No description available", name, yPosition);
    } catch (error) {
      console.error("PDF generation failed:", error);
      doc.setFontSize(18);
      doc.text(progress.name || "Untitled", 10, 40);
      doc.setFontSize(12);
      doc.text(`Topic: ${progress.topic || "No topic"}`, 10, 50);
      doc.text(`Status: ${progress.status || "Unknown"}`, 10, 60);
      doc.text(`Tag: ${progress.tag || "None"}`, 10, 70);
      doc.text(
        `Created: ${progress.createdAt ? new Date(progress.createdAt).toLocaleDateString() : "Not available"}`,
        10, 80
      );
      doc.text(
        `Updated: ${progress.updatedAt ? new Date(progress.updatedAt).toLocaleDateString() : "Not available"}`,
        10, 90
      );
      addContentToPDF(doc, progress.description || "No description available", progress.name || "Untitled", 100);
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
        doc.save(`${title || "Progress"}.pdf`);
        return;
      }
    }

    contentLines.forEach((line, index) => {
      doc.text(line, 10, yPosition + index * 10);
    });

    doc.save(`${title || "Progress"}.pdf`);
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10 pt-20 px-4 text-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-10"></div>
      <div className="max-w-3xl mx-auto mt-6 md:mt-10 pt-20 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">{progress.name || "Loading..."}</h1>

        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600">
            Topic: <span className="font-semibold">{progress.topic || "No topic"}</span> |{" "}
            Created: {progress.createdAt
              ? new Date(progress.createdAt).toLocaleDateString()
              : "Not available"}
          </p>
          <p className="text-lg text-gray-600">
            Updated: {progress.updatedAt
              ? new Date(progress.updatedAt).toLocaleDateString()
              : "Not available"}
          </p>
          {progress.user && (
            <p className="text-lg text-gray-600">
              Created By: <span className="font-semibold">{progress.user.fullname} ({progress.user.email})</span>
            </p>
          )}
        </div>

        {progress.image && (
          <div className="mb-8">
            <img
              src={`http://localhost:8080/uploads/${progress.image}`}
              alt={progress.name || "Progress Image"}
              className="w-full h-auto object-cover rounded-lg shadow-lg"
              onError={(e) => (e.target.src = "https://via.placeholder.com/600x400")}
            />
          </div>
        )}

        <div className="bg-gray-100 rounded-lg shadow-lg p-6 mb-8">
          <p className="text-lg font-semibold mb-2">Description:</p>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {progress.description || "No description available"}
          </p>
          <p className="text-lg font-semibold mt-4">Status:</p>
          <p className="text-lg">{progress.status || "Unknown"}</p>
          <p className="text-lg font-semibold mt-4">Tag:</p>
          <p className="text-lg">{progress.tag || "None"}</p>
        </div>

        <div className="text-center mb-4 flex justify-center space-x-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            onClick={downloadPDF}
          >
            Download Progress as PDF
          </button>
          <button
            className={`${
              isSpeaking && !isPaused ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105`}
            onClick={startSpeech}
            disabled={!progress.name && !progress.description}
          >
            {isSpeaking && !isPaused ? "Speaking..." : isPaused ? "Resume" : "Listen to Progress"}
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
    </div>
  );
}