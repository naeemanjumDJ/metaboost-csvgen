import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Client, VideoCompact } from "youtubei";

const page = async () => {
  const youtube = new Client();
  const channel = await youtube.findOne("naeem anjum", {
    type: "channel",
  });
  await channel?.videos.next();
  return (
    <>
      <h1 className="text-5xl font-semibold">Tutorials</h1>
      <p className="mt-2 pb-4 text-sm text-muted-foreground">
        Learn how to use earn money with our tutorials
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {channel?.videos.items.map((video) => (
          <Link
            href={`https://www.youtube.com/watch?v=${video.id}`}
            key={video.id}
            target="_blank"
          >
            <div className="relative aspect-video">
              <Image
                src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                alt={video.title}
                fill
                className="rounded-lg object-cover"
              />
            </div>
            <h3 className="mt-2 font-semibold">{video.title}</h3>
            <p className="text-sm text-muted-foreground">{video.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
};

export default page;
