import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import { FaPlus } from 'react-icons/fa';

const TeachableMachineComponent = () => {
  const videoRef = useRef(null);
  const [predictionResult, setPredictionResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Start the webcam feed when the component mounts
    startWebcam();
    return () => {
      // Clean up the webcam feed when the component unmounts
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing the webcam:', error);
    }
  };

  const predict = async () => {
    try {
      setLoading(true);

      const modelURL = 'https://teachablemachine.withgoogle.com/models/zDe1ROvXf/model.json';
      const metadataURL = 'https://teachablemachine.withgoogle.com/models/zDe1ROvXf/metadata.json';

      const model = await tmImage.load(modelURL, metadataURL);
      const prediction = await model.predict(videoRef.current);

      const maxProbabilityIndex = prediction.reduce((maxIndex, current, currentIndex, arr) =>
        current.probability > arr[maxIndex].probability ? currentIndex : maxIndex, 0);

      const maxClass = prediction[maxProbabilityIndex].className;

      setLoading(false);
      setPredictionResult(maxClass);
    } catch (error) {
      console.error('Error predicting:', error);
      setLoading(false);
      setPredictionResult('Error predicting');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen md:bg-gray-900 bg-red-600">
      <div className="relative p-4 md:p-8 bg-red-600 rounded-3xl w-full max-w-xs md:max-w-lg lg:max-w-md mx-4">
        {/* Increase padding and width on larger screens */}
        <div className="absolute top-0 left-0 m-4">
          <div className="w-12 h-12 bg-blue-500 border-4 border-gray-400 rounded-full"></div>
        </div>
        <div className="flex absolute top-0 right-0 m-4 space-x-1">
          <div className="w-6 h-6 bg-red-500 border-4 border-gray-400 rounded-full"></div>
          <div className="w-6 h-6 bg-yellow-500 border-4 border-gray-400 rounded-full"></div>
          <div className="w-6 h-6 bg-green-500 border-4 border-gray-400 rounded-full"></div>
        </div>
        <div className="video-container mb-4 mt-16">
          <video
            ref={videoRef}
            className="rounded-2xl border-8 border-white shadow-lg"
            autoPlay
            playsInline
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={predict}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-all font-press-start"
            disabled={loading}
          >
            SCAN
          </button>
          <FaPlus className="text-black text-7xl" />
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md mt-4">
          <p className="text-xl font-bold text-center text-gray-800 uppercase font-press-start">
            {predictionResult}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeachableMachineComponent;
