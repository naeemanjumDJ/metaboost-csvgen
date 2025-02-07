"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiCall } from "@/lib/api";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { AiApi } from "@prisma/client";
import { useAppDispatch, useAppSelector } from "@/store/useRedux";
import { Switch } from "@/components/ui/switch";
import { updateUserData } from "@/store/slices/userSlice";
import { Info } from "lucide-react";
import {
  CREDITS_PER_FILE_WITH_USER_VISION_API,
  CREDITS_PER_FILE_WITH_VISION_API,
} from "@/config/api";

const SettingsPage = () => {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    openAiApiKey: user.data?.openAiApiKey || "",
    geminiApiKey: user.data?.geminiApiKey || "",
    preferredApi: user.data?.preferredApi || "OPENAI",
    useAiVision: user.data?.useAiVision || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoaded(true);
    try {
      const res = await apiCall("POST", "/api/user/settings", formData);
      if (res?.success) {
        toast.success(res.msg);
        dispatch(updateUserData());
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("An error occurred while saving settings");
    } finally {
      setIsLoaded(false);
    }
  };
  return (
    <>
      <h1 className="text-5xl font-semibold">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Only add the API keys if you want to use your own API keys.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-1 flex-col gap-6">
        <div className="rounded-2xl bg-muted p-5">
          <h3 className="font-semibold">OpenAI API Key</h3>
          <div className="flex items-center gap-10">
            <div className="flex-1">
              <p className="mt-2 text-muted-foreground">
                Enter your OpenAI API key here
              </p>
              <Input
                type="text"
                value={formData.openAiApiKey}
                onChange={(e) =>
                  setFormData({ ...formData, openAiApiKey: e.target.value })
                }
                placeholder="Enter your OpenAI API key"
                className="mt-2 bg-white"
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-muted p-5">
          <h3 className="font-semibold">Gemini API Key</h3>
          <p className="mt-2 text-muted-foreground">
            Enter your Gemini API key here
          </p>
          <Input
            type="text"
            value={formData.geminiApiKey}
            onChange={(e) =>
              setFormData({ ...formData, geminiApiKey: e.target.value })
            }
            placeholder="Enter your Gemini API key"
            className="mt-2 bg-white"
          />
        </div>
        {formData.openAiApiKey && formData.geminiApiKey && (
          <div className="rounded-2xl bg-muted p-5">
            <h3 className="font-semibold">Preferred API</h3>
            <p className="mt-2 text-muted-foreground">
              Select your preferred API when both keys are present
            </p>
            <div className="mt-2">
              <Select
                defaultValue={user.data?.preferredApi || "OPENAI"}
                onValueChange={(value) => {
                  setFormData({ ...formData, preferredApi: value as AiApi });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select API" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPENAI">OpenAI</SelectItem>
                  <SelectItem value="GEMINI">Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="rounded-2xl bg-muted p-5">
          <h3 className="font-semibold">Use AI Vision (new)</h3>
          <p className="mt-2 text-muted-foreground">
            Enable AI Vision to get best results
          </p>
          <div className="mt-2">
            <Switch
              checked={formData.useAiVision}
              onCheckedChange={(checked) => {
                setFormData({
                  ...formData,
                  useAiVision: checked,
                });
              }}
            />
          </div>
          {formData.useAiVision && (
            <div className="mt-2 flex items-center gap-2">
              <Info size={20} />
              <p className="text-muted-foreground">
                Using AI Vision will cost you{" "}
                <strong>{CREDITS_PER_FILE_WITH_VISION_API}</strong> credits per
                file and{" "}
                <strong>{CREDITS_PER_FILE_WITH_USER_VISION_API}</strong> if you
                use your own API key.
              </p>
            </div>
          )}
        </div>
        <div className="mt-auto flex justify-end">
          <Button type="submit" size="lg" disabled={isLoaded}>
            Save
          </Button>
        </div>
      </form>
    </>
  );
};

export default SettingsPage;
