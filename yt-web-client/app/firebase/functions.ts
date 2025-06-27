import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");
const getVideosFunction = httpsCallable(functions, "getVideos");

export interface Video {
  id?: string;
  uid?: string;
  title?: string;
  filename?: string;
  description?: string;
  status?: "processing" | "processed";
}

export async function uploadVideo(file: File) {
  try {
    // Await the Firebase function call
    const response: any = await generateUploadUrl({
      fileExtension: file.name.split(".").pop(), //sending the extension to generateUploadUrl service because it needs it (care for the name since our function expects the same)
    });

    // Check if we got a valid response
    if (!response?.data?.url) {
      throw new Error("No upload URL received from Firebase function");
    }

    console.log("Generated upload URL:", response.data.url);

    // Upload the file via the signed URL
    const uploadResponse = await fetch(response?.data?.url, {
      method: "PUT",
      body: file,
      headers: { //we need to tell what type of file we are uploading
        "Content-Type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    console.log("File uploaded successfully");
    return response.data; //optional
  } catch (error) {
    console.error("Error in uploadVideo:", error);
    throw error;
  }
}

export async function getVideos() {
  try {
    const response: any = await getVideosFunction();
    return response.data as Video[]; // Ensure the response is typed as an array of Video
  } catch (error) {
    console.error("Error in getVideos:", error);
    throw error;
  }
}
