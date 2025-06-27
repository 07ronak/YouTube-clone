import Link from "next/link";
import Image from "next/image";
import { getVideos } from "./firebase/functions";

export default async function Home() {
  const videos = await getVideos();

  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 px-4 py-6">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch?v=${video.filename}`}
          className="flex flex-col gap-2 cursor-pointer"
        >
          <Image
            src={`/thumbnail.webp`}
            alt={video.title || "Video thumbnail"}
            width={120}
            height={80}
            className="rounded-lg w-full object-cover"
          />
          <div className="text-sm font-medium line-clamp-2">{video.title}</div>
        </Link>
      ))}
    </main>
  );
}

export const revalidate = 30; //disable caching (refetch every 30 seconds)
