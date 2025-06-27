"use client";
import { CloudUpload } from "lucide-react";
import { uploadVideo } from "../firebase/functions";

const Upload = () => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0); // Get the first file from the input
    if (file) {
      // Handle the file upload logic here
      handleUpload(file);
      console.log("File selected:", file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
        const respone = await uploadVideo(file); 
        alert(`File uploaded successfully: ${JSON.stringify(respone)}`);
    } catch (error) {
      alert("Error uploading file. Please try again.");
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <input
        id="upload"
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <label
        htmlFor="upload"
        className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition"
      >
        <CloudUpload className="w-5 h-5" />
        <span>Upload Video</span>
      </label>
    </div>
  );
};

export default Upload;
