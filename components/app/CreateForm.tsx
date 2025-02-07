//@ts-nocheck

"use client";
import { MAX_FILES, TASK_FETCH_INTERVAL } from "@/config/api";
import { generators } from "@/config/app";
import { apiCall } from "@/lib/api";
import { handleDownload, uploadMultipleImages, fileToBase64 } from "@/lib/utils";
import { updateUserData } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/store/useRedux";
import { ExtendedFile, Generator, PostData } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import FileMetadata from "./FileMetadataPreview";
import Generators from "./Generators";
import Uploader from "./Uploader";

// Add this interface near the top of the file
interface BatchRequestData {
  generatorId: number;
  numKeywords: number;
  titleChars: number;
  files: {
    id: string;
    filename: string;
    title: string;
    base64?: string;
  }[];
  taskId?: string;
}

const CreateForm = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [currentStep, setCurrentStep] = useState(1);
  const [postData, setPostData] = useState<PostData>({
    generatorId: 1,
    numKeywords: 25,
    titleChars: 100,
    files: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    processed: 0,
    success: 0,
    error: 0,
  });
  const [selectedGenerator, setSelectedGenerator] = useState<Generator | null>(
    null,
  );

  useEffect(() => {
    if (postData.generatorId) {
      const generator = generators.find((g) => g.id === postData.generatorId);
      setSelectedGenerator(generator || null);
    }
  }, [postData.generatorId]);

  const handleGenerate = async () => {
    const generator = generators.find((g) => g.id === postData.generatorId);
    if (!generator) {
      toast.error("Invalid generator");
      return;
    }
    if (postData.files.length > MAX_FILES) {
      toast.error(`You can only process ${MAX_FILES} files at a time`);
      return;
    }
    setIsGenerating(true);
    setCurrentStep(3);

    try {
      let taskId: string | undefined;
      const BATCH_SIZE = 3;
      const batches = [];
      
      // Create batches
      for (let i = 0; i < postData.files.length; i += BATCH_SIZE) {
        batches.push(postData.files.slice(i, i + BATCH_SIZE));
      }

      // Initialize progress
      setProgress({
        total: postData.files.length,
        processed: 0,
        success: 0,
        error: 0,
      });

      // Process batches sequentially
      for (const batch of batches) {
        const files = await Promise.all(
          batch.map(async (file) => {
            if (user.data?.useAiVision) {
              const base64 = await fileToBase64(file.file);
              return {
                id: file.id,
                filename: file.filename,
                title: file.title,
                base64: base64,
              };
            }
            return {
              id: file.id,
              filename: file.filename,
              title: file.title,
            };
          })
        );

        const data: BatchRequestData = {
          generatorId: postData.generatorId,
          numKeywords: postData.numKeywords,
          titleChars: postData.titleChars,
          files,
          taskId, // Pass previous taskId for subsequent batches
        };

        const res = await apiCall("POST", "/api/generate", data);
        if (!res || !res.success) {
          throw new Error("Failed to process batch");
        }

        taskId = res.taskId;
        
        // Wait for this batch to complete before processing next batch
        await new Promise<void>((resolve) => {
          const checkBatchStatus = async () => {
            const statusData = await apiCall("GET", `/api/task?taskId=${taskId}`);
            if (statusData.success) {
              const { status, result } = statusData.task;
              
              if (status === "COMPLETED") {
                // Update file metadata for this batch
                setPostData((prev) => ({
                  ...prev,
                  files: prev.files.map((file) => {
                    const matchingResult = result?.find((r: any) => r.id === file.id);
                    if (matchingResult) {
                      return {
                        ...file,
                        metadata: {
                          ...matchingResult.metadata,
                          status: matchingResult.metadata.status ?? true
                        }
                      };
                    }
                    return file;
                  })
                }));
                resolve();
              } else if (status === "FAILED") {
                throw new Error("Batch processing failed");
              } else {
                setTimeout(checkBatchStatus, TASK_FETCH_INTERVAL);
              }
            }
          };
          checkBatchStatus();
        });
      }

      setCompleted(true);
      setIsGenerating(false);
      dispatch(updateUserData());
      toast.success("All files processed successfully");

    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process files");
      setIsGenerating(false);
      setCurrentStep(2);
    }
  };

  const startDownload = async () => {
    const metadata = postData.files.map((file) => file.metadata) as any;
    handleDownload({ metadata, generator: selectedGenerator as Generator });
  };

  return (
    <div className="mt-5 flex flex-1 flex-col">
      <div className="flex-1">
        {currentStep === 1 && (
          <Generators postData={postData} setPostData={setPostData} />
        )}

        {currentStep === 2 && (
          <Uploader postData={postData} setPostData={setPostData} />
        )}

        {currentStep === 3 && (
          <>
            <p className="text-lg font-medium text-muted-foreground">
              {completed
                ? `Processing completed, you can download the files now`
                : `Processing  ${progress.total} files ...`}
              <br />
            </p>
            <div className="mt-8 space-y-6">
              {/* <div className="rounded-lg bg-white p-6 shadow">
                <div className="flex items-center justify-between">
                  <h3 className="mb-4 text-lg font-semibold">Progress</h3>

                  <div className="mb-2 flex justify-between text-sm">
                    {progress.processed > 0
                      ? Math.floor((progress.processed / progress.total) * 100)
                      : 0}
                    %
                  </div>
                </div>
                <Progress
                  value={(progress.processed / progress.total) * 100}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm">
                  <span>
                    Processed: {progress.processed}/{progress.total}
                  </span>
                  <span className="text-green-500">
                    Success:{" "}
                    {
                      postData.files.filter((f) => f.metadata?.status === true)
                        .length
                    }
                  </span>
                  <span className="text-red-500">
                    Error:{" "}
                    {
                      postData.files.filter((f) => f.metadata?.status === false)
                        .length
                    }
                  </span>
                </div>
              </div> */}

              <div className="max-h-[calc(100vh-410px)] overflow-y-auto rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Files</h3>
                <ul className="space-y-3">
                  {postData.files.map((file, index) => (
                    <FileMetadata
                      key={index}
                      file={file}
                      postData={postData}
                      setPostData={setPostData}
                      generator={selectedGenerator as Generator}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-5 right-20 flex items-center justify-end gap-5 rounded-xl bg-gray-500/20 px-10 py-2">
        {currentStep > 1 && currentStep < 3 && (
          <Button
            onClick={() => setCurrentStep(currentStep - 1)}
            size={"lg"}
            variant={"secondary"}
          >
            Back
          </Button>
        )}

        {currentStep < 2 && currentStep < 3 && (
          <Button onClick={() => setCurrentStep(currentStep + 1)} size={"lg"}>
            Next
          </Button>
        )}

        {currentStep === 2 && (
          <Button
            size={"lg"}
            disabled={postData.files.length === 0}
            onClick={handleGenerate}
          >
            Generate
          </Button>
        )}
        {currentStep === 3 && (
          <>
            <Button
              onClick={() => {
                setCurrentStep(1);
                setPostData((prev) => {
                  return {
                    ...prev,
                    files: [],
                  };
                });
                setCompleted(false);
              }}
              size={"lg"}
              variant={"secondary"}
            >
              Generate More
            </Button>
            <Button
              size={"lg"}
              disabled={
                postData.files.length === 0 || isGenerating || !completed
              }
              onClick={startDownload}
            >
              Download
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateForm;
