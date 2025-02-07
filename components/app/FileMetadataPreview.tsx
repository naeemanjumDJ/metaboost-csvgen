//@ts-nocheck
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, truncateString } from "@/lib/utils";
import { ExtendedFile, Generator, PostData } from "@/types";
import { Edit, Save, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multi-select";
import { Textarea } from "../ui/textarea";

interface FileMetadataProps {
  file: ExtendedFile;
  postData: PostData;
  setPostData: React.Dispatch<React.SetStateAction<PostData>>;
  generator: Generator;
}

const FileMetadata = ({
  file,
  postData,
  setPostData,
  generator,
}: FileMetadataProps) => {
  const [currentEditedFile, setCurrentEditedFile] =
    useState<ExtendedFile>(file);
  const [editingKeywords, setEditingKeywords] = useState("");

  const deleteFile = (fileId: string): void => {
    setPostData((prevState) => ({
      ...prevState,
      files: prevState.files.filter((file) => file.id !== fileId),
    }));
  };

  const categoriesToOptions = () => {
    if (!generator || !generator.categories) return [];
    return generator?.categories.map((category) => ({
      value: category.id.toString(),
      label: category.name,
    }));
  };

  const handleSave = () => {
    // set success true in the metadata
    const updatedFile = {
      ...currentEditedFile,
      metadata: {
        ...currentEditedFile.metadata,
        status: true,
      },
    };

    setPostData((prevState) => ({
      ...prevState,
      files: prevState.files.map((f) =>
        f.id === currentEditedFile?.id ? updatedFile : f,
      ),
    }));
  };

  return (
    <li
      key={file.id}
      className="group relative flex flex-col items-start gap-4 rounded-lg bg-gray-50 p-4 shadow-sm transition-all duration-300 hover:shadow-md md:flex-row md:items-center"
    >
      <Image
        src={file.url ?? file.thumbnail}
        alt={file.title}
        width={200}
        height={200}
        className="h-20 w-20 rounded-lg object-cover"
      />
      <div className="w-full flex-grow space-y-2 2xl:pr-20">
        {file.metadata?.status === null ? (
          <span className="block text-sm font-medium text-gray-700">
            Processing...
          </span>
        ) : file.metadata?.status === false ? (
          <span className="block text-sm font-medium text-red-500">
            Error processing file
          </span>
        ) : (
          <>
            {(file.metadata?.Title ||
              file.metadata?.["Image Name"] ||
              file.metadata?.Description) && (
              <span className="line-clamp-1 block text-lg font-semibold text-gray-700">
                {truncateString(
                  file.metadata?.Title ||
                    file.metadata?.["Image Name"] ||
                    file.metadata?.Description ||
                    "",
                  50,
                )}
              </span>
            )}
            {file.metadata?.Keywords && (
              <div className="flex flex-wrap gap-1 text-2xs text-gray-500">
                {file.metadata?.Keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-secondary px-2 py-0.5 text-white"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {file.metadata?.Category && (
              <div className="text-xs text-gray-500">
                Category:{" "}
                {
                  generator?.categories?.find(
                    (c) => c.id === file.metadata?.Category,
                  )?.name
                }
              </div>
            )}
            {file.metadata?.Categories && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Categories:</span>
                {file.metadata?.Categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-secondary px-2 py-0.5 text-white"
                  >
                    {generator.categories?.find((c) => c.id === cat)?.name}
                  </span>
                ))}
              </div>
            )}
            {file.metadata?.Model && (
              <div className="text-xs text-gray-500">
                Model: {file.metadata?.Model}
              </div>
            )}
          </>
        )}
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="icon-sm"
              variant="secondary"
              className="rounded-full"
              aria-label="Edit file"
              onClick={() => {
                setEditingKeywords(file.metadata.Keywords.join(", "));
                setCurrentEditedFile(file);
              }}
            >
              <Edit size={16} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit File Details</DialogTitle>
            </DialogHeader>
            {(file.metadata?.Title ||
              file.metadata?.["Image Name"] ||
              generator.csvRequirements.structure.includes("Title") ||
              generator.csvRequirements.structure.includes("Image Name")) && (
              <div>
                <label className="mb-1 text-xs font-bold" htmlFor="title">
                  Title:
                </label>
                <Input
                  id="title"
                  placeholder="Title"
                  value={
                    currentEditedFile.metadata?.Title ||
                    currentEditedFile.metadata?.["Image Name"] ||
                    ""
                  }
                  onChange={(e) => {
                    setCurrentEditedFile((prevState) => ({
                      ...prevState,
                      metadata: {
                        ...prevState.metadata,
                        ...(file.metadata?.Title
                          ? { Title: e.target.value }
                          : { "Image Name": e.target.value }),
                      },
                    }));
                  }}
                  // onChange={(e) => {
                  //   setPostData((prevState) => ({
                  //     ...prevState,
                  //     files: prevState.files.map((f) =>
                  //       f.id === file.id
                  //         ? {
                  //             ...f,
                  //             metadata: {
                  //               ...f.metadata,
                  //               ...(file.metadata?.Title
                  //                 ? { Title: e.target.value }
                  //                 : {
                  //                     "Image Name":
                  //                       file.metadata?.["Image Name"],
                  //                   }),
                  //             },
                  //           }
                  //         : f,
                  //     ),
                  //   }));
                  // }}
                />
              </div>
            )}
            {(file.metadata?.Description ||
              generator.csvRequirements.structure.includes("Description")) && (
              <div>
                <label className="mb-1 text-xs font-bold" htmlFor="description">
                  Description:
                </label>
                <Textarea
                  id="description"
                  placeholder="Description"
                  value={currentEditedFile.metadata?.Description || ""}
                  onChange={(e) => {
                    setCurrentEditedFile((prevState) => ({
                      ...prevState,
                      metadata: {
                        ...prevState.metadata,
                        Description: e.target.value,
                      },
                    }));
                  }}
                  // onChange={(e) => {
                  //   setPostData((prevState) => ({
                  //     ...prevState,
                  //     files: prevState.files.map((f) =>
                  //       f.id === file.id
                  //         ? {
                  //             ...f,
                  //             metadata: {
                  //               ...f.metadata,
                  //               Description: e.target.value,
                  //             },
                  //           }
                  //         : f,
                  //     ),
                  //   }));
                  // }}
                />
              </div>
            )}
            {(file.metadata?.Keywords ||
              generator.csvRequirements.structure.includes("Keywords")) && (
              <div>
                <label className="mb-1 text-xs font-bold" htmlFor="keywords">
                  Keywords:
                </label>
                <Textarea
                  id="keywords"
                  placeholder="Keywords"
                  value={editingKeywords}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditingKeywords(value);
                    let keywords = value.split(",").map((k) => k.trim());
                    keywords = keywords.filter((k) => k !== "");
                    setCurrentEditedFile((prevState) => ({
                      ...prevState,
                      metadata: {
                        ...prevState.metadata,
                        Keywords: keywords,
                      },
                    }));
                  }}
                  // onChange={(e) => {
                  //   const value = e.target.value;
                  //   const keywords = value.split(",").map((k) => k.trim());
                  //   setPostData((prevState) => ({
                  //     ...prevState,
                  //     files: prevState.files.map((f) =>
                  //       f.id === file.id
                  //         ? {
                  //             ...f,
                  //             metadata: {
                  //               ...f.metadata,
                  //               Keywords: keywords,
                  //             },
                  //           }
                  //         : f,
                  //     ),
                  //   }));
                  // }}
                />
              </div>
            )}
            {(file.metadata?.Category ||
              generator.csvRequirements.structure.includes("Category")) && (
              <div>
                <label className="mb-1 text-xs font-bold" htmlFor="category">
                  Category:
                </label>
                <Select
                  defaultValue={
                    currentEditedFile.metadata?.Category
                      ? currentEditedFile.metadata?.Category.toString()
                      : "1"
                  }
                  onValueChange={(value) =>
                    setCurrentEditedFile((prevState) => ({
                      ...prevState,
                      metadata: {
                        ...prevState.metadata,
                        Category: parseInt(value),
                      },
                    }))
                  }
                  // onValueChange={(value) => {
                  //   setPostData((prevState) => ({
                  //     ...prevState,
                  //     files: prevState.files.map((f) =>
                  //       f.id === file.id
                  //         ? {
                  //             ...f,
                  //             metadata: {
                  //               ...f.metadata,
                  //               Category: parseInt(value),
                  //             },
                  //           }
                  //         : f,
                  //     ),
                  //   }));
                  // }}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {generator?.categories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(file.metadata?.Categories ||
              generator.csvRequirements.structure.includes("Categories")) && (
              <div>
                <label className="mb-1 text-xs font-bold" htmlFor="categories">
                  Categories:
                </label>
                <MultiSelect
                  options={categoriesToOptions()}
                  defaultValue={
                    currentEditedFile.metadata?.Categories
                      ? currentEditedFile.metadata?.Categories.map(
                          (c) => c?.toString() || "",
                        )
                      : []
                  }
                  onValueChange={(value) =>
                    setCurrentEditedFile((prevState) => ({
                      ...prevState,
                      metadata: {
                        ...prevState.metadata,
                        Categories: value.map((v) => parseInt(v)),
                      },
                    }))
                  }
                  // onValueChange={(value) => {
                  //   console.log(value);
                  //   setPostData((prevState) => ({
                  //     ...prevState,
                  //     files: prevState.files.map((f) =>
                  //       f.id === file.id
                  //         ? {
                  //             ...f,
                  //             metadata: {
                  //               ...f.metadata,
                  //               Categories: value.map((v) => parseInt(v)),
                  //             },
                  //           }
                  //         : f,
                  //     ),
                  //   }));
                  // }}
                  variant="secondary"
                />
              </div>
            )}
            {(file.metadata?.Model ||
              generator.csvRequirements.structure.includes("Model")) && (
              <div>
                <label className="mb-1 text-xs font-bold" htmlFor="category">
                  Model:
                </label>
                <Select
                  defaultValue={
                    currentEditedFile.metadata?.Model
                      ? currentEditedFile.metadata?.Model.toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    setCurrentEditedFile((prevState) => ({
                      ...prevState,
                      metadata: {
                        ...prevState.metadata,
                        Model: value,
                      },
                    }))
                  }
                  // onValueChange={(value) => {
                  //   setPostData((prevState) => ({
                  //     ...prevState,
                  //     files: prevState.files.map((f) =>
                  //       f.id === file.id
                  //         ? {
                  //             ...f,
                  //             metadata: {
                  //               ...f.metadata,
                  //               Model: value,
                  //             },
                  //           }
                  //         : f,
                  //     ),
                  //   }));
                  // }}
                >
                  <SelectTrigger className="">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {generator?.models?.map((models) => (
                      <SelectItem key={models} value={models}>
                        {models}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogClose asChild>
              <Button size="lg" className="mt-4" onClick={handleSave}>
                <Save size={16} />
                Save
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
        <Button
          size="icon-sm"
          variant="destructive"
          className="rounded-full"
          aria-label="Delete file"
          onClick={() => deleteFile(file.id)}
        >
          <X size={16} />
        </Button>
      </div>
    </li>
  );
};

export default FileMetadata;
