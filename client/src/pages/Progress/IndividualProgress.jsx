import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";

// Adjust to your logo path
// Import Swiper styles and components


export default function IndividualProgress() {
  const { id } = useParams();
  const [progress, setProgress] = useState({});
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if speech is active
  const [isPaused, setIsPaused] = useState(false); // Track if speech is paused

  useEffect(() => {
    if (!id) {
      setError("No progress ID provided");
      return;
    }
    axios
      .get(`http://localhost:8080/progress/${id}`)
      .then((res) => {
        console.log("Progress data fetched:", res.data);
        setProgress(res.data);
      })
      .catch((err) => {
        console.error("Error fetching progress:", err);
        setError("Failed to fetch progress. Please try again later.");
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
    const textToSpeak = `${progress.name || "Untitled Progress"}. Topic: ${progress.topic || "No topic"}. ${
      progress.description || "No description available"
    }. Status: ${progress.status || "Unknown"}. Tag: ${progress.tag || "None"}.`;
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

      // Add progress metadata
      doc.setFontSize(18);
      const name = progress.name || "Untitled";
      doc.text(name, 10, 40);

      // Add topic
      doc.setFontSize(12);
      const topic = progress.topic || "No topic";
      doc.text(`Topic: ${topic}`, 10, 50);

      // Add status
      doc.text(`Status: ${progress.status || "Unknown"}`, 10, 60);

      // Add tag
      doc.text(`Tag: ${progress.tag || "None"}`, 10, 70);

      // Add date
      const date = progress.createdAt
        ? new Date(progress.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString();
      doc.text(`Created: ${date}`, 10, 80);

      // Load and add the progress image if available
      let yPosition = 90;
      if (progress.image) {
        const imageUrl = `http://localhost:8080/uploads/${progress.image}`;
        console.log("Attempting to load progress image from:", imageUrl);
        try {
          const imageBase64 = await loadImageAsBase64(imageUrl);
          console.log("Progress image loaded successfully (first 50 chars):", imageBase64.slice(0, 50) + "...");
          const format = imageBase64.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
          doc.addImage(imageBase64, format, 10, yPosition, 150, 80);
          yPosition += 90;
        } catch (error) {
          console.error("Failed to load progress image:", error);
        }
      }

      // Add description
      addContentToPDF(doc, progress.description || "No description available", name, yPosition);
    } catch (error) {
      console.error("PDF generation failed:", error);
      // Fallback if any image fails
      doc.setFontSize(18);
      doc.text(progress.name || "Untitled", 10, 40);
      doc.setFontSize(12);
      doc.text(`Topic: ${progress.topic || "No topic"}`, 10, 50);
      doc.text(`Status: ${progress.status || "Unknown"}`, 10, 60);
      doc.text(`Tag: ${progress.tag || "None"}`, 10, 70);
      doc.text(
        `Created: ${progress.createdAt ? new Date(progress.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`,
        10,
        80
      );
      addContentToPDF(doc, progress.description || "No description available", progress.name || "Untitled", 90);
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
        console.log(`Truncated content: Only ${maxLines} of ${contentLines.length} lines fit.`);
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
      <div>
     
        <div className="max-w-3xl mx-auto mt-10 pt-20 px-4 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
     
      </div>
    );
  }

  return (
    <div>
      <div className="pb-10">
        
      </div>
      <div className="max-w-3xl mx-auto mt-6 md:mt-10 pt-20 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">{progress.name || "Loading..."}</h1>

        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600">
            Topic: <span className="font-semibold">{progress.topic || "No topic"}</span> |{" "}
            {progress.createdAt
              ? new Date(progress.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString()}
          </p>
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
      <div>
       
      </div>
    </div>
  );
}