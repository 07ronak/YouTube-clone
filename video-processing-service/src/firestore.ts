/* To save the metadata about the video in firestore */
import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

initializeApp({
  credential: credential.applicationDefault(),
});

const firestore = new Firestore();

const videoCollectionId = "videos";

export interface Video {
  id?: string;
  uid?: string;
  title?: string;
  filename?: string;
  description?: string;
  status?: "processing" | "processed";
}

async function getVideo(videoId: string) {
  const snapshot = await firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .get();
  return (snapshot.data() as Video) ?? {};
}

export function setVideo(videoId: string, video: Video) {
  return firestore
    .collection(videoCollectionId)
    .doc(videoId)
    .set(video, { merge: true }); //If there is already video stored for that id and we are only specifing few things like description or updating status 
}

export async function isVideoNew(videoId: string) {
  const video = await getVideo(videoId);
  return video?.status === undefined;
}
