import axios from "axios";
import toast from "react-hot-toast";

// api call general function
export async function apiCall<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  route: string,
  data?: Record<string, any>,
) {
  try {
    const response = await axios({
      method,
      url: route,
      data,
    });
    const apiResponse = response.data;
    if (!apiResponse.success) {
      toast.error(apiResponse.msg);
      return null;
    }
    return apiResponse;
  } catch (error: any) {
    if (error.response) {
      toast.error(error.response.data.msg);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("Something went wrong, please try again later.");
    }
    return null;
  }
}
