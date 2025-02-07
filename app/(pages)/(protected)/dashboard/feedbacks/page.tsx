"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FeedbackType, FeedbackStatus } from "@prisma/client";

type Feedback = {
  id: string;
  title: string;
  description: string;
  types: FeedbackType[];
  status: FeedbackStatus;
  user: { name: string };
  _count: { upvotes: number };
  createdAt: string;
  hasUserUpvoted: boolean; // Add this field
};

const FeedbacksPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<FeedbackType | "ALL">("ALL");
  const [status, setStatus] = useState<FeedbackStatus | "ALL">("ALL");

  useEffect(() => {
    fetchFeedbacks();
  }, [page, search, type, status]);

  const fetchFeedbacks = async () => {
    const response = await fetch(
      `/api/feedbacks?page=${page}&search=${search}&type=${type}&status=${status}`,
    );
    const data = await response.json();
    setFeedbacks(data.feedbacks);
    setTotalPages(data.totalPages);
  };

  const handleUpvote = async (feedbackId: string) => {
    const response = await fetch(`/api/feedbacks/${feedbackId}/upvote`, {
      method: "POST",
    });
    const updatedFeedback = await response.json();

    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((feedback) =>
        feedback.id === feedbackId
          ? {
              ...feedback,
              _count: { upvotes: updatedFeedback.upvoteCount },
              hasUserUpvoted: updatedFeedback.hasUserUpvoted,
            }
          : feedback,
      ),
    );
  };
  return (
    <>
      <h1 className="mb-4 text-4xl font-semibold">Feedbacks</h1>
      <p className="mb-8 text-lg text-gray-600">
        Here you can see all the feedbacks and vote for your favorites.
      </p>

      <div className="mb-8 flex gap-4">
        <Input
          placeholder="Search feedbacks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={type}
          onValueChange={(value) => setType(value as FeedbackType | "ALL")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.values(FeedbackType).map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as FeedbackStatus | "ALL")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(FeedbackStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {feedbacks.map((feedback) => (
          <Card key={feedback.id}>
            <CardHeader>
              <CardTitle>{feedback.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-gray-600">
                {feedback.description}
              </p>
              <div className="mb-2 flex gap-2">
                {feedback.types.map((type) => (
                  <span
                    key={type}
                    className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="text-sm">
                Status: <span className="font-semibold">{feedback.status}</span>
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button
                onClick={() => handleUpvote(feedback.id)}
                variant={feedback.hasUserUpvoted ? "secondary" : "default"}
              >
                {feedback.hasUserUpvoted ? "Upvoted" : "Upvote"} (
                {feedback._count.upvotes})
              </Button>
              <span className="text-sm text-gray-500">
                By {feedback.user.name} on{" "}
                {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        <span className="self-center">
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default FeedbacksPage;
