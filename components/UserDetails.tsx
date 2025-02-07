import React from "react";
import { Shield, Eye, CreditCard, Info } from "lucide-react";
import { UserState } from "@/store/slices/userSlice";
import {
  CREDITS_PER_FILE_WITH_OUR_API,
  CREDITS_PER_FILE_WITH_USER_API,
  CREDITS_PER_FILE_WITH_USER_VISION_API,
  CREDITS_PER_FILE_WITH_VISION_API,
} from "@/config/api";

const UserDetailsUI = ({ user }: { user: UserState }) => {
  const getApiStatus = () => {
    if (user.data?.geminiApiKey && user.data.openAiApiKey) {
      return `Yes (${user.data.preferredApi})`;
    } else if (user.data?.geminiApiKey) {
      return "Yes (Gemini)";
    } else if (user.data?.openAiApiKey) {
      return "Yes (OpenAI)";
    }
    return "No";
  };

  const getCredits = () => {
    if (user.data?.geminiApiKey || user.data?.openAiApiKey) {
      return user.data?.useAiVision
        ? CREDITS_PER_FILE_WITH_USER_VISION_API
        : CREDITS_PER_FILE_WITH_USER_API;
    }
    return user.data?.useAiVision
      ? CREDITS_PER_FILE_WITH_VISION_API
      : CREDITS_PER_FILE_WITH_OUR_API;
  };

  return (
    <div className="mt-5 space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
        Usage Details
      </h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-6 w-6 text-primary" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <span className="font-medium">Own API:</span> {getApiStatus()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Eye className="h-6 w-6 text-green-500" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <span className="font-medium">Vision:</span>{" "}
            {user.data?.useAiVision ? "Enabled" : "Disabled"}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <CreditCard className="h-6 w-6 text-secondary" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            <span className="font-medium">Credits:</span> {getCredits()}/image
          </p>
        </div>
        {!user.data?.useAiVision && (
          <div className="flex items-center space-x-3">
            <Info className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Without vision, filename will be used to generate metadata.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsUI;
