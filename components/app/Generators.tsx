import {
  CREDITS_PER_FILE_WITH_OUR_API,
  CREDITS_PER_FILE_WITH_USER_API,
  CREDITS_PER_FILE_WITH_USER_VISION_API,
  CREDITS_PER_FILE_WITH_VISION_API,
} from "@/config/api";
import { generators } from "@/config/app";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/useRedux";
import { PostData } from "@/types";
import React from "react";
import { File } from "../icons";
import { Input } from "../ui/input";
import UserDetailsUI from "../UserDetails";

interface GeneratorProps {
  postData: PostData;
  setPostData: React.Dispatch<React.SetStateAction<PostData>>;
}

const Generators = ({ postData, setPostData }: GeneratorProps) => {
  const user = useAppSelector((state) => state.user);

  return (
    <>
      <div className="relative flex justify-between text-lg font-medium text-muted-foreground">
        <p>Choose a generator to get started</p>
      </div>
      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
        {generators.map((generator, index) => (
          <div
            key={index}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl bg-muted p-5",
              postData.generatorId === generator.id &&
                !generator.comingSoon &&
                "bg-gradient-to-r from-primary to-secondary text-white",
              generator.comingSoon && "cursor-not-allowed opacity-70",
            )}
            onClick={() =>
              !generator.comingSoon &&
              setPostData({ ...postData, generatorId: generator.id })
            }
          >
            <div
              className="relative"
              style={{
                color: generator.color,
              }}
            >
              <File />
              <generator.icon className="absolute -bottom-2 -right-2" />
            </div>
            <p className="font-medium">{generator.title}</p>
            {generator.comingSoon && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black bg-opacity-50">
                <span className="text-lg font-bold text-white">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-5">
        {generators
          .find((generator) => generator.id === postData.generatorId)
          ?.csvRequirements.structure.includes("Title") && (
          <div className="flex-1">
            <label
              htmlFor="titleChars"
              className="text-sm text-muted-foreground"
            >
              Max Number of characters in title: (max 200)
            </label>
            <Input
              type="number"
              id="titleChars"
              min={1}
              max={50}
              value={postData.titleChars}
              onChange={(e) =>
                setPostData({
                  ...postData,
                  titleChars:
                    parseInt(e.target.value) > 200
                      ? 200
                      : parseInt(e.target.value),
                })
              }
              className="mt-1"
            />
          </div>
        )}
        {generators
          .find((generator) => generator.id === postData.generatorId)
          ?.csvRequirements.structure.includes("Keywords") && (
          <div className="flex-1">
            <label
              htmlFor="numKeywords"
              className="text-sm text-muted-foreground"
            >
              Max number of keywords: (max 50)
            </label>
            <Input
              type="number"
              id="numKeywords"
              min={1}
              max={200}
              value={postData.numKeywords}
              onChange={(e) =>
                setPostData({
                  ...postData,
                  numKeywords:
                    parseInt(e.target.value) > 50
                      ? 50
                      : parseInt(e.target.value),
                })
              }
              className="mt-1"
            />
          </div>
        )}
      </div>
      <UserDetailsUI user={user} />
    </>
  );
};

export default Generators;
