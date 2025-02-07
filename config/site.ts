import { Metadata } from "next";

export const site: Metadata = {
  title: "MetaBoost | Bulk Metadata Generator for Microstock",
  description:
    "Effortlessly create metadata for thousands of files. Our tool generates CSV files for easy uploading to major microstock websites like AdobeStock, Dreamstime, Freepik, Shutterstock, Vecteezy, and 123rf.",
  keywords: [
    "MetaBoost",
    "metadata generator",
    "microstock tool",
    "bulk file upload",
    "CSV creator",
    "AdobeStock",
    "Dreamstime",
    "Freepik",
    "Shutterstock",
    "Vecteezy",
    "123rf",
    "stock photography",
    "digital assets",
    "file management",
    "time-saving tool",
    "content creator",
    "photographer workflow",
  ],
  authors: [
    {
      name: "Waseem Anum",
      url: "https://waseemanjum.com",
    },
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "MetaBoost - Bulk Metadata Generator for Microstock Sites",
    description:
      "Boost your microstock uploads with MetaBoost. Generate metadata CSV files for easy uploading to major microstock websites.",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: "Bulk Metadata Generator",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    title: "MetaBoost - Bulk Metadata Generator for Microstock",
    description:
      "Boost your microstock uploads with MetaBoost. Generate metadata CSV files for easy uploading to major microstock websites.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/twitter-image.jpg`],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  category: "Technology",
  applicationName: "MetaBoost",
  referrer: "strict-origin-when-cross-origin",
  creator: "Waseem Anjum",
  publisher: "MetaBoost",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL as string),
  other: {
    "revisit-after": "7 days",
    language: "English",
  },
};
