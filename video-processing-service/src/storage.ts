// 1. GCS interaction
// 2. local file system interaction
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawBucketName = "raw-videos-ronak"; //download from this bucket
const processedBucketName = "processed-videos-ronak"; //upload to this bucket after processing

const localRawVideosPath = "./raw_videos";
const localProcessedVideosPath = "./processed_videos";
/* Delete videos from local system after uploading the processed file into processedBucket */

/* Create the local directories for raw and processed videos. */
export function setupDirectories() {
  ensureDirectoryExists(localRawVideosPath);
  ensureDirectoryExists(localProcessedVideosPath);
  console.log(
    `Directories set up: ${localRawVideosPath} and ${localProcessedVideosPath}`
  );
}

/**
 * @param {string} rawVideoName - The name of the raw video file to download.
 * @param {string} processedVideoName - The name of the processed video file to upload.
 * @returns A Promise that resolves when the video is successfully  processed.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideosPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") // 360p resolution
      .on("end", () => {
        console.log(`Video processing finished sucessfully`);
        resolve();
      })
      .on("error", (err) => {
        console.log(`Error processing video:, ${err.message}`);
        reject(err);
      })
      .save(`${localProcessedVideosPath}/${processedVideoName}`);
  });
}

/**
 * @param {string} filename -The name of the video file to download from the raw bucket i.e.
 * {@link rawBucketName} bucket into the {@link localRawVideosPath} folder.
 * @returns A Promise that resolves when the video is successfully downloaded.
 */
export async function downloadRawVideo(filename: string) {
  await storage
    .bucket(rawBucketName)
    .file(filename)
    .download({ destination: `${localRawVideosPath}/${filename}` });

  console.log(
    `gs://${rawBucketName}/${filename} downloaded to ${localRawVideosPath}/${filename}`
  );
}

/**
 * @param {string} filename - The name of the file to upload to the processed bucket i.e.
 * {@link localProcessedVideosPath} folder into the {@link processedBucketName} bucket.
 * @returns A Promise that resolves when the video is successfully uploaded.
 */
export async function uploadProcessedVideo(filename: string) {
  const bucket = storage.bucket(processedBucketName);

  await bucket.upload(`${localProcessedVideosPath}/${filename}`, {
    destination: filename,
  });

  console.log(
    `File ${filename} uploaded to gs://${processedBucketName}/${filename}`
  );
  await bucket.file(filename).makePublic(); // Make the file publicly accessible since anyone can access the uploaded YT video
}

/* Cleanup function since we don't want to have raw and processed video stored locally unnecessarily */
/**
 * @param filePath - The path of the file to delete.
 * @returns A Promise that resolves when the file is successfully deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file at ${filePath}:`, err);
          reject(err);
        } else {
          console.log(`File at ${filePath} deleted successfully.`);
          resolve();
        }
      });
    } else {
      console.log(`File ${filePath} does not exist. No deletion needed.`);
      resolve();
    }
  });
}

/**
 * @param filename - The name of the file to delete from the
 * {@link localRawVideosPath} folder.
 * @returns A Promise that resolves when the file is successfully deleted.
 */
export function deleteRawVideo(filename: string) {
  const filePath = `${localRawVideosPath}/${filename}`;
  return deleteFile(filePath);
}

/**
 * @param filename - The name of the file to delete from the
 * {@link localProcessedVideosPath} folder.
 * @returns A Promise that resolves when the file is successfully deleted.
 */
export function deleteProcessedVideo(filename: string) {
  const filePath = `${localProcessedVideosPath}/${filename}`;
  return deleteFile(filePath);
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param dirPath - The path of the directory to check or create.
 */
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creation of nested directories
    console.log(`Directory created: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
}
