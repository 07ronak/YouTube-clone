import express from "express";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from "./storage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res: any) => {
  //Get the bucket and file names from the Cloud Pub/Sub message
  //This endpoint is going to envoked by the Pub/Sub message (not by us or users)
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf-8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }
  } catch (error) {
    console.error("Error parsing message data:", error);
    return res.status(400).send("Invalid message payload.");
  }
  const inputFileName = data.name; //Format of file: <UID>-<DATE>.<EXTENSION>
  const outputFileName = `processed-${inputFileName}`;

  const videoId = inputFileName.split(".")[0]; // Extract video ID from the file name

  if (!isVideoNew(videoId)) {
    return res.status(400).send("Video is not new or already processed.");
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0], // Assuming UID is the first part of the file name
      status: "processing",
    });
  }

  //Download the raw video from the cloud storage bucket
  await downloadRawVideo(inputFileName);

  //Process the video using ffmpeg, converting it to 360p resolution
  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (error: any) {
    await Promise.all([ // We want to delete files from local if processing fails because atleast we have the raw file locally
      deleteProcessedVideo(outputFileName), // Delete processed video if it exists
      deleteRawVideo(inputFileName), // Delete raw video if it exists
    ]);
    console.error("Error processing video:", error);
    return res
      .status(500)
      .send(`Internal Server Error; failed processing video`);
  }

  //Upload the processed video to the cloud storage bucket
  await uploadProcessedVideo(outputFileName);

  //Update the video status in Firestore
  await setVideo(videoId, {
    filename: outputFileName,
    status: "processed",
  });

  //We also want to also delete videos from locally if we were sucessfull!
  await Promise.all([
    deleteProcessedVideo(outputFileName), // Delete processed video if it exists
    deleteRawVideo(inputFileName), // Delete raw video if it exists
  ]);

  return res.status(200).send("Processing finished successfully");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Video Processing Service is running on port ${PORT}`);
});
