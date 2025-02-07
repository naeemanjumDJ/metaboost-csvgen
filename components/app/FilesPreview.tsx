import { ExtendedFile, PostData } from "@/types";
import { Grid2X2, ListTodo, X, Edit2, Check } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { cn, formatBytes } from "@/lib/utils";
import Image from "next/image";
import { Input } from "../ui/input";

interface FilePreviewProps {
  postData: PostData;
  setPostData: React.Dispatch<React.SetStateAction<PostData>>;
}

const FilesPreview: React.FC<FilePreviewProps> = ({
  postData,
  setPostData,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");

  const deleteFile = (fileId: string): void => {
    setPostData((prevState) => ({
      ...prevState,
      files: prevState.files.filter((file) => file.id !== fileId),
    }));
  };

  const startEditing = (fileId: string, currentTitle: string) => {
    setEditingFileId(fileId);
    setEditedTitle(currentTitle);
  };

  const saveEditedTitle = (fileId: string) => {
    setPostData((prevState) => ({
      ...prevState,
      files: prevState.files.map((file) =>
        file.id === fileId ? { ...file, title: editedTitle } : file,
      ),
    }));
    setEditingFileId(null);
  };

  const renderFileTitle = (file: ExtendedFile) => {
    if (editingFileId === file.id) {
      return (
        <div className="flex items-center">
          <Input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="mr-2 max-w-80"
          />
          <Button
            size="icon"
            variant="secondary"
            onClick={() => saveEditedTitle(file.id)}
            aria-label="Save title"
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center">
        <span className="mr-2 block text-sm font-medium text-gray-700">
          {file.title}
        </span>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => startEditing(file.id, file.title)}
          aria-label="Edit title"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <>
      {postData.files.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-100 bg-white py-6 ">
          <div className="mb-6 flex flex-col items-center justify-between gap-3 px-4 sm:flex-row">
            <div>
              <h4 className="text-2xl font-bold text-gray-800">
                Selected Files ({postData.files.length})
              </h4>
              <p className="text-sm text-gray-500">
                You can update filenames to make them more descriptive.
              </p>
            </div>
            <div className="flex space-x-2 rounded-lg bg-gray-100 p-1">
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "transition-all duration-300",
                  viewMode === "list" && "bg-white text-gray-800 shadow-md",
                )}
              >
                <ListTodo className="mr-2 h-4 w-4" />
                List
              </Button>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => setViewMode("grid")}
                className={cn(
                  "transition-all duration-300",
                  viewMode === "grid" && "bg-white text-gray-800 shadow-md",
                )}
              >
                <Grid2X2 className="mr-2 h-4 w-4" />
                Grid
              </Button>
            </div>
          </div>

          <div className=" overflow-y-auto px-4">
            {viewMode === "list" ? (
              <ul className="space-y-3">
                {postData.files.map((file) => (
                  <li
                    key={file.id}
                    className="group flex items-center gap-4 rounded-lg bg-gray-50 p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <Image
                      src={file.url ? file.url : file.thumbnail}
                      alt={file.title}
                      width={200}
                      height={200}
                      className="h-16 w-16 rounded-lg object-cover shadow-sm"
                    />
                    <div className="flex-grow">
                      {renderFileTitle(file)}
                      <span className="text-xs text-gray-500">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteFile(file.id)}
                      className="rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-label="Delete file"
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {postData.files.map((file) => (
                  <li
                    key={file.id}
                    className="group relative rounded-lg bg-gray-50 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="mb-2 aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={file.thumbnail}
                        alt={file.filename}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {renderFileTitle(file)}
                    <span className="text-xs text-gray-500">
                      {formatBytes(file.size)}
                    </span>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteFile(file.id)}
                      className="absolute right-2 top-2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-label="Delete file"
                    >
                      <X />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FilesPreview;
