"use client";
import PayPalButton from "@/components/PayPalButton";
import TabSwitch from "@/components/TabSwitch";
import { Paypal } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CREDITS_PER_FILE_WITH_OUR_API,
  CREDITS_PER_FILE_WITH_USER_API,
  CREDITS_PER_FILE_WITH_USER_VISION_API,
  CREDITS_PER_FILE_WITH_VISION_API,
  MIN_CREDIT_ALLOWED_TO_PURCHASE,
  paymentDetails,
} from "@/config/api";
import {
  calculateCreditPrice,
  calculateCustomPackageData,
  cn,
} from "@/lib/utils";
import {
  ArrowUpRight,
  CheckCheck,
  Copy,
  CopyCheck,
  InfoIcon,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

type CreditPackage = {
  credits: number;
  price: number;
};

type SelectedPackage = CreditPackage | null;

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy text");
    }
  };

  return (
    <Button onClick={handleCopy} variant="outline" size="sm" className="ml-2">
      {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
    </Button>
  );
};

const BankDetails = () => (
  <div className="mx-auto mt-4 max-w-2xl rounded-lg bg-muted p-6 shadow-md">
    <h2 className="mb-4 text-2xl font-bold text-primary">Payment Details</h2>

    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold">JazzCash</h3>
      <div className="space-y-2">
        {[
          {
            label: "Name",
            value: paymentDetails.jazzCash.accountTitle,
          },
          {
            label: "Number",
            value: paymentDetails.jazzCash.number,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="font-medium">{label}:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{value}</span>
              <CopyButton text={value} />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold">Crypto</h3>
      <div className="space-y-2">
        {[
          {
            label: "Binance Id",
            value: paymentDetails.binanceId,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="font-medium">{label}:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{value}</span>
              <CopyButton text={value} />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold">Cryptocurrency</h3>
      <div className="space-y-2">
        {[
          {
            label: "Wallet Address",
            value: "0x90008a64e57438ad8ae3c8bee9cfeb70b8eee74d",
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="font-medium">{label}:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{value}</span>
              <CopyButton text={value} />
            </div>
          </div>
        ))}
      </div>
    </div> */}

    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <InfoIcon className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Payment Confirmation
          </h3>
          <div className="mt-2 flex items-center text-sm text-blue-700">
            <p>After payment, please send a screenshot to our WhatsApp: </p>
            <Link
              href={"https://wa.link/m5rrem"}
              target="_blank"
              className="flex items-center font-bold"
            >
              {paymentDetails.whatsappNumber} <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface CreditPackageProps {
  credits: number;
  onSelect: (credits: number, price: number) => void;
  section: "our" | "own";
  description: string;
}

const CreditPackage: React.FC<CreditPackageProps> = ({
  credits,
  onSelect,
  section,
  description,
}) => {
  const { price, discount } = calculateCreditPrice(credits);
  const value = Math.floor(
    credits /
      (section === "our"
        ? CREDITS_PER_FILE_WITH_OUR_API
        : CREDITS_PER_FILE_WITH_USER_API),
  );
  const valueWithVision = Math.floor(
    credits /
      (section === "our"
        ? CREDITS_PER_FILE_WITH_VISION_API
        : CREDITS_PER_FILE_WITH_USER_VISION_API),
  );
  return (
    <Card className="flex w-full flex-col rounded-3xl lg:h-[600px]">
      <CardHeader>
        <CardTitle>{credits.toLocaleString()} Credits</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mt-5 text-5xl font-semibold">
          ${price.toFixed(2)}
          {discount > 0 && (
            <span className="ml-2 text-2xl text-gray-500 line-through">
              ${price + discount}
            </span>
          )}
        </p>
        <div className="mt-9 flex items-center gap-2">
          <CheckCheck size={18} className="text-green-500" />
          <span className="block text-lg">~{value} images</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <CheckCheck size={18} className="text-green-500" />
          <span className="block text-lg">
            ~{valueWithVision} images with Vision API
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <CheckCheck size={18} className="text-green-500" />
          <span className="block text-lg">
            {section === "our"
              ? "Don't Need a API Key"
              : "Your OpenAI/Gemini API Key"}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <CheckCheck size={18} className="text-green-500" />
          <span className="block text-lg">
            {section === "our"
              ? "Fast Processing"
              : "Speed Depends on your API"}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <CheckCheck size={18} className="text-green-500" />
          <span className="block text-lg">AI Vision</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          onClick={() => onSelect(credits, price)}
          size={"lg"}
          className="w-full"
        >
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

interface CustomPackageProps {
  onSelect: (credits: number, price: number) => void;
  section: "our" | "own";
}

const CustomPackage: React.FC<CustomPackageProps> = ({ onSelect, section }) => {
  const [inputValue, setInputValue] = useState("");

  const [data, setData] = useState({
    price: 0,
    discount: 0,
    credits: 0,
    images: 0,
    visionImages: 0,
  });
  const [selectedTab, setSelectedTab] = useState<
    "credits" | "price" | "images"
  >("credits");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
      const data = calculateCustomPackageData(
        Number(value),
        selectedTab,
        section === "our",
      );
      console.log(data);
      setData(data);
    }
  };

  const handleSubmit = () => {
    // min check for all tabs
    const numberValue = Number(inputValue);
    if (numberValue <= 0) {
      return toast.error("Please enter a valid amount");
    }

    if (selectedTab === "credits") {
      if (numberValue < MIN_CREDIT_ALLOWED_TO_PURCHASE) {
        return toast.error(
          `Minimum credits allowed to purchase is ${MIN_CREDIT_ALLOWED_TO_PURCHASE}`,
        );
      }
    } else if (selectedTab === "price") {
      if (
        numberValue <
        calculateCreditPrice(MIN_CREDIT_ALLOWED_TO_PURCHASE).price +
          calculateCreditPrice(MIN_CREDIT_ALLOWED_TO_PURCHASE).discount
      ) {
        return toast.error(
          `Minimum price allowed to purchase is $${calculateCreditPrice(MIN_CREDIT_ALLOWED_TO_PURCHASE).price + calculateCreditPrice(MIN_CREDIT_ALLOWED_TO_PURCHASE).discount}`,
        );
      }
    } else if (selectedTab === "images") {
      if (
        numberValue <
        Math.ceil(
          MIN_CREDIT_ALLOWED_TO_PURCHASE /
            (section === "our"
              ? CREDITS_PER_FILE_WITH_OUR_API
              : CREDITS_PER_FILE_WITH_USER_API),
        )
      ) {
        return toast.error(
          `Minimum images allowed to purchase is ${Math.ceil(MIN_CREDIT_ALLOWED_TO_PURCHASE / (section === "our" ? CREDITS_PER_FILE_WITH_OUR_API : CREDITS_PER_FILE_WITH_USER_API))}`,
        );
      }
    }
    onSelect(data.credits, data.price);
  };

  const getPlaceholder = () => {
    switch (selectedTab) {
      case "credits":
        return `Enter credits amount (min ${MIN_CREDIT_ALLOWED_TO_PURCHASE})`;
      case "price":
        return `Enter price amount (min $${calculateCreditPrice(MIN_CREDIT_ALLOWED_TO_PURCHASE).price + calculateCreditPrice(MIN_CREDIT_ALLOWED_TO_PURCHASE).discount})`;
      case "images":
        return `Enter number of images (min ${Math.ceil(MIN_CREDIT_ALLOWED_TO_PURCHASE / (section === "our" ? CREDITS_PER_FILE_WITH_OUR_API : CREDITS_PER_FILE_WITH_USER_API))})`;
    }
  };

  useEffect(() => {
    const data = calculateCustomPackageData(
      Number(inputValue),
      selectedTab,
      section === "our",
    );
    console.log(data);
    setData(data);
  }, [section]);

  return (
    <Card className="flex w-full flex-col rounded-3xl lg:h-[600px]">
      <CardHeader>
        <CardTitle>Custom Package</CardTitle>
        <CardDescription>Choose your own amount</CardDescription>
      </CardHeader>
      <CardContent>
        <TabSwitch
          options={[
            { label: "Credits", value: "credits" },
            { label: "Price", value: "price" },
            { label: "Images", value: "images" },
          ]}
          onChange={(value) => {
            setInputValue("");
            setData({
              price: 0,
              discount: 0,
              credits: 0,
              images: 0,
              visionImages: 0,
            });
            setSelectedTab(value as "credits" | "price" | "images");
          }}
          defaultValue={selectedTab}
        />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={getPlaceholder()}
          className="mt-4 text-lg"
        />
        <div className="mt-4">
          <p className="mt-5 text-5xl font-semibold">
            ${data.price}
            {data.discount > 0 && (
              <span className="ml-2 text-2xl text-gray-500 line-through">
                ${(data.price + data.discount).toFixed(2)}
              </span>
            )}
          </p>
        </div>
        <ul className="mt-9 space-y-2">
          {selectedTab === "price" || selectedTab === "images" ? (
            <li className="flex items-center gap-2">
              <CheckCheck size={18} className="text-green-500" />
              <span className="block text-lg">~{data.credits} credits</span>
            </li>
          ) : null}
          {selectedTab !== "images" ? (
            <li className="flex items-center gap-2">
              <CheckCheck size={18} className="text-green-500" />
              <span className="block text-lg">~{data.images} images</span>
            </li>
          ) : null}

          <li className="flex items-center gap-2">
            <CheckCheck size={18} className="text-green-500" />
            <span className="block text-lg">
              ~{data.visionImages} images with Vision API
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCheck size={18} className="text-green-500" />
            <span className="block text-lg">Customizable amount</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCheck size={18} className="text-green-500" />
            <span className="block text-lg">All Starter Features</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button onClick={handleSubmit} size="lg" className="w-full">
          Continue
        </Button>
      </CardFooter>
    </Card>
  );
};

const BuyCreditsPage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage>(null);
  const [section, setSection] = useState<"our" | "own">("our");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "bank" | null>(
    null,
  );

  const handlePackageSelect = (credits: number, price: number): void => {
    setSelectedPackage({ credits, price });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h1 className="mb-4 text-5xl font-semibold">Buy Credits</h1>
        {!selectedPackage && (
          <TabSwitch
            options={[
              { label: "I don't have API Key", value: "our" },
              { label: "I'll use my API key", value: "own" },
            ]}
            onChange={(value) => setSection(value as "our" | "own")}
            defaultValue={section}
          />
        )}
      </div>

      {!selectedPackage ? (
        <div className="mx-auto mt-20 grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-5">
          <CreditPackage
            credits={20000}
            onSelect={handlePackageSelect}
            section={section}
            description="Starter: Great for beginners."
          />
          <CreditPackage
            credits={50000}
            onSelect={handlePackageSelect}
            section={section}
            description="Pro: Best value for high-volume users."
          />
          <CustomPackage onSelect={handlePackageSelect} section={section} />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-2xl font-semibold">
            Selected Package: {selectedPackage.credits.toLocaleString()} Credits
            for ${selectedPackage.price}
          </h2>
          {!paymentMethod ? (
            <div className="mx-auto mt-20 flex min-h-96 flex-col justify-center gap-3">
              <h3 className="mb-5 text-4xl">Select Payment Method</h3>
              <Button
                onClick={() => setPaymentMethod("paypal")}
                size="lg"
                variant={"ghost"}
                className="bg-gray-200"
              >
                <Paypal />
                Pay with PayPal/Card
              </Button>
              <Button onClick={() => setPaymentMethod("bank")} size="lg">
                Direct Bank, JazzCash
              </Button>
            </div>
          ) : paymentMethod === "paypal" ? (
            <div className="mt-10">
              <PayPalButton credits={selectedPackage.credits} />
            </div>
          ) : (
            <BankDetails />
          )}
          <Button
            onClick={() => {
              setSelectedPackage(null);
              setPaymentMethod(null);
            }}
            className="ml-auto mt-4 block"
            size={"lg"}
            variant={"destructive"}
          >
            Choose Different Package
          </Button>
        </div>
      )}
    </div>
  );
};

export default BuyCreditsPage;
