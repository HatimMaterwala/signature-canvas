"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [textColor, settextColor] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [font, setFont] = useState("1");
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState([]);

  const bgref = useRef();
  const eraserRef = useRef();
  const isDrawing = useRef(false);
  const prevPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = bgref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = bg || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
    }
  }, [bg]);

  const getScaledCoordinates = (e) => {
    const canvas = bgref.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    const canvas = bgref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const { x, y } = getScaledCoordinates(e);
      prevPos.current = { x, y };
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  // Draw a line as the mouse moves
  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = bgref.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const { x, y } = getScaledCoordinates(e);
      ctx.strokeStyle = isEraser ? bg : textColor;
      ctx.lineWidth = font;
      ctx.lineCap = "round";

      ctx.lineTo(x, y);
      ctx.stroke();

      prevPos.current = { x, y };
    }
  };

  // Stop drawing and save the canvas state to history (for undo)
  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = bgref.current;
    if (canvas) {
      const snapshot = canvas.toDataURL();
      setHistory((prevHistory) => [...prevHistory, snapshot]);
    }
  };

  const handleClear = () => {
    const canvas = bgref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setBg("#ffffff");
    settextColor("#000000");
    setFont("1");
    setHistory([]);
  };

  const handleSave = () => {
    const canvas = bgref.current;
    if (!canvas) return;
    const imageUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "canvas_img.png";

    let c = confirm("Click OK to download");
    if (c) {
      localStorage.setItem("canvasDoc", imageUrl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRetrieve = () => {
    const canvas = bgref.current;
    if (!canvas) return;
    const storedImage = localStorage.getItem("canvasDoc");
    if (!storedImage) {
      alert("No Saved Image");
      return;
    }
    const image = new Image();
    image.onload = () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = storedImage;
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);

    const canvas = bgref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (newHistory.length > 0) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = newHistory[newHistory.length - 1];
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleEraserToggle = () => {
    setIsEraser((prev) => !prev);
  }

    useEffect(() => {
      if (eraserRef.current) {
        eraserRef.current.style.backgroundColor = isEraser ? "pink" : "gray";
        eraserRef.current.style.boxShadow = isEraser ? "2px 2px 5px black" : "none";
        bgref.current.style.cursor = isEraser ? 'cell' : "crosshair";
      }
    }, [isEraser]);

  return (
    <div className="mainApp w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="appContainer w-[95vw] h-[90vh] lg:w-[60vw] lg:h-[80vh] mb-9 flex flex-col gap-4">
        <div className="top flex gap-2 justify-around items-center">
          <div className="textColor w-1/3">
            <p className="text-center">Text Color</p>
            <input
              onChange={(e) => settextColor(e.target.value)}
              value={textColor}
              className="w-full p-1 border"
              type="color"
              id="textColor"
            />
          </div>
          <div className="backgroundColor w-1/3">
            <p className="text-center">Background</p>
            <input
              onChange={(e) => setBg(e.target.value)}
              value={bg}
              className="w-full p-1 border"
              type="color"
              id="bgColor"
            />
          </div>
          <div className="fontSize w-1/3">
            <p className="text-center">Font Size</p>
            <select
              onChange={(e) => setFont(e.target.value)}
              value={font}
              className="w-full border"
              name="font"
              id="fontSize"
            >
              <option value="1">1px</option>
              <option value="2">2px</option>
              <option value="3">3px</option>
              <option value="5">5px</option>
              <option value="10">10px</option>
              <option value="20">20px</option>
              <option value="30">30px</option>
              <option value="40">40px</option>
              <option value="50">50px</option>
            </select>
          </div>
        </div>

        <canvas
          ref={bgref}
          className="border w-full h-[60vh]"
          width={600}
          height={250}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        <div className="bottom flex flex-wrap justify-center gap-1">
          <button
            onClick={handleClear}
            type="button"
            className="btn btn-success"
          >
            <img src="/clear.png" alt="Clear" width={30} height={30} />
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="btn btn-danger"
          >
            <img src="/download.svg" width={30} height={30} alt="download" />
          </button>
          <button
            onClick={handleRetrieve}
            type="button"
            className="btn btn-warning"
          >
            <img src="/last.png" width={30} height={30} alt="previous"/>
          </button>
          <button
            onClick={handleUndo}
            type="button"
            className=" btn btn-info"
          >
            <img src="/undo.png" width={30} height={30} alt="undo" />
          </button>
          <button
          ref={eraserRef}
            onClick={handleEraserToggle}
            type="button"
            className="btn btn-secondary"
          >
            <img src="/eraser.png" width={30} height={30} alt="eraser" />
          </button>
        </div>
      </div>
    </div>
  );
}
