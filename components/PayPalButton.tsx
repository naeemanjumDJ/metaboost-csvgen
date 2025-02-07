"use client";
import React, { useRef } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { updateUserData } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/useRedux";
import { apiCall } from "@/lib/api";

interface PayPalButtonProps {
  credits: number;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({  credits }) => {
  const transactionIdRef = useRef<string | null>(null);
  const dispatch = useAppDispatch();

  const createOrder = async () => {
    try {
      const response = await apiCall("POST", "/api/paypal/create-order", {
        credits,
      });
      if (response.success) {
        transactionIdRef.current = response.transactionId;
        return response.orderId;
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      console.log(data);
      const response = await apiCall("POST", "/api/paypal/capture-order", {
        orderID: data.orderID,
        transactionId: transactionIdRef.current,
      });
      console.log("Capture result", response);
      // Here you can show a success message to the user
      dispatch(updateUserData());
    } catch (error) {
      console.error("Failed to capture order:", error);
      // Here you can show an error message to the user
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
      }}
    >
      <PayPalButtons

        createOrder={createOrder} onApprove={onApprove} />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
