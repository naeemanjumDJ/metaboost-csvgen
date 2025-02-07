import { allowedFileTypes } from "@/config/app";
import { cn } from "@/lib/utils";
import { ExtendedFile, PostData } from "@/types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { File } from "../icons";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";
import FilesPreview from "./FilesPreview";
import imageCompression from "browser-image-compression";
import { MAX_FILES } from "@/config/api";

interface UploaderProps {
  postData: PostData;
  setPostData: React.Dispatch<React.SetStateAction<PostData>>;
}

const Uploader = ({ postData, setPostData }: UploaderProps) => {
  const [processing, setProcessing] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setTotal((prev) => prev + acceptedFiles.length);
    handleFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedFileTypes.reduce(
      (acc, fileType) => {
        acc[fileType.type] = [];
        return acc;
      },
      {} as { [key: string]: string[] },
    ),
  });

  const handleFiles = async (files: File[]) => {
    setProcessing(true);
    for (const file of files) {
      setCurrent((prev) => prev + 1);
      const id = Math.random().toString(36).substr(2, 9);
      // const thumbnail = await generateThumbnail(file);
      setPostData((prevData) => {
        return {
          ...prevData,
          files: [
            ...prevData.files,
            {
              id,
              filename: file.name,
              title: file.name.split(".")[0],
              size: file.size,
              type: file.type,
              thumbnail: "/images/place.jpg",
              file,
              metadata: {
                Title: "",
                status: null,
                Keywords: [],
              },
            },
          ],
        };
      });
    }
    setProcessing(false);
    setCurrent(0);
  };

  const generateThumbnail = async (file: File): Promise<string> => {
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 200,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const thumbnail = URL.createObjectURL(compressedFile);

      return thumbnail;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      throw error;
    }
  };

  return (
    <>
      {/* fixed loader when processing */}
      {processing && (
        <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white bg-opacity-90">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-10 w-10">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-dashed border-primary"></div>
            </div>
            <p>
              Processing {current} of {total} files, please wait...
            </p>
          </div>
        </div>
      )}
      <p className="text-lg font-medium text-muted-foreground">
        Select all your files you want to generate
      </p>
      <div
        {...getRootProps()}
        className={cn(
          "mt-8 cursor-pointer rounded-xl border-2 border-dashed text-center transition-all duration-300 max-w-3xl mx-auto",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
          postData.files.length > 0 ? "mx-auto max-w-xl p-4" : "p-10",
        )}
      >
        <input {...getInputProps()} />
        {postData.files.length === 0 ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-5">
              {allowedFileTypes.map((fileType, index) => (
                <div key={index} className="relative text-[#808e9b]">
                  <File size={60} />
                  <p
                    className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-md px-1 py-0.5 text-xs text-white"
                    style={{
                      backgroundColor: fileType.color,
                    }}
                  >
                    {fileType.title}
                  </p>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-medium">
              {isDragActive
                ? "Drop the files here"
                : "Drag and Drop Files Here"}{" "}
              (max {MAX_FILES})
            </h3>
            <p className="mt-2 text-sm text-black/20">
              or click to select files
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <Upload className="mr-2 h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-600">
              {postData.files.length} file(s) selected
            </p>
          </div>
        )}
        <Button
          size={postData.files.length > 0 ? "sm" : "lg"}
          className={cn("mt-4", postData.files.length > 0 && "text-xs")}
          onClick={() => {}}
        >
          {postData.files.length > 0 ? "Add More Files" : "Browse Files"}
        </Button>
      </div>
      <FilesPreview postData={postData} setPostData={setPostData} />
    </>
  );
};

export default Uploader;
