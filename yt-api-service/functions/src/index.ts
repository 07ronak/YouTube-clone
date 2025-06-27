import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp(); //this works since we already locally authenticated firebase (```firebase login```)terminal command

const firestore = new Firestore();
const storage = new Storage();

const rawBucketName = "raw-videos-ronak";

const videoCollectionId = "videos";

export interface Video {
  id?: string;
  uid?: string;
  title?: string;
  filename?: string;
  description?: string;
  status?: "processing" | "processed";
}
/* Event drived function (get called autmotically by firebase everytime we create a new user in firebase-auth) */
export const createUser = functions.auth.user().onCreate(async (user) => {
  const userInfo = {
    uid: user.uid, //get id
    email: user.email, //get email
    photoURL: user.photoURL, //get profile picture
  };
  //adds a collection names 'users' in firestore database that will store all the above data
  await firestore.collection("users").doc(user.uid).set(userInfo);

  logger.info(`User created with UID: ${JSON.stringify(userInfo)}`);
});

export const generateUploadUrl = onCall(
  {maxInstances: 1},
  async (request) => {
    /* check if the user is authenticated (only then it can generate a signed-URl ofcourse)*/
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to generate upload URL."
      );
    }

    const auth = request.auth;
    const data = request.data; /* We need this because we will need the extenstion of the video file, user is uploading to feed that into name */
    const bucket = storage.bucket(rawBucketName);

    /* Generate a unique file name using the user's UID and current timestamp */
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    /* Get a v4 signed URL for uploading a file */
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000 /* URL expires in 15 minutes */,
    });
    return {url, fileName};
  }
);

export const getVideos = onCall({maxInstances: 1}, async () => {
  const snapshot = await firestore
    .collection(videoCollectionId)
    .limit(10)
    .get();
  return snapshot.docs.map((doc) => doc.data());
});
