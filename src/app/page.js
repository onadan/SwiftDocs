"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { BeatLoader } from "react-spinners";
import dynamic from "next/dynamic";

const schema = yup
  .object({
    productName: yup.string().required("Please enter a product name"),
    details: yup.string().required("Please enter product details"),
    softwareTypes: yup.array().of(yup.string().required()).min(1),
    additionalInfo: yup.string(),
  })
  .required();

export default function Page() {
  // const handleSubmitIdea = () => {}
  const [currentScreen, setCurrentScreen] = useState("home");
  const [generatedDocument, setGeneratedDocument] = useState(null);

  const renderScreen = () => {
    if (currentScreen === "home") {
      return (
        <HomeScreen
          setGeneratedDocument={setGeneratedDocument}
          setCurrentScreen={setCurrentScreen}
        />
      );
    } else if (currentScreen === "editor") {
      return (
        <>
          <Editor
            generatedDocument={generatedDocument}
            setCurrentScreen={setCurrentScreen}
          />
        </>
      );
    }
  };

  return (
    <main className="flex min-h-screen h-full w-full justify-center p-5">
      <div className="h-full pt-20 w-full flex flex-col items-center justify-center">
        <div className="text-center flex flex-col gap-2 mb-16">
          <h1 className="text-5xl font-semibold text-main text-center">
            SwiftDocs
          </h1>
          <p className="italic">Product System Documentation Made Easy!</p>
        </div>

        {renderScreen()}
      </div>
    </main>
  );
}

const Editor = ({ generatedDocument, setCurrentScreen }) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  const [content, setContent] = useState(`${generatedDocument.text}`);
  const [hasMounted, setHasMounted] = useState(false);
  const downloadAsPDF = () => {
    // Create a div element for the content.
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = document;

    // Configuration for the PDF generation.
    const pdfOptions = {
      margin: 10,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // Generate the PDF and offer it as a download.
    html2pdf()
      .from(contentDiv)
      .set(pdfOptions)
      .outputPdf((pdf) => {
        const pdfBlob = pdf.output("blob");
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "document.pdf";
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  useEffect(() => {
    if (content) {
      setHasMounted(true);
    }
  }, [content]);

  if (!hasMounted) {
    return (
      <>
        <div className="max-w-[600px] w-full h-[400px] flex flex-col gap-1 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <BeatLoader color="#9acc57" />
          </div>
        </div>
      </>
    );
  }

  if (hasMounted) {
    return (
      <>
        <div className="max-w-[600px] w-full h-full flex flex-col items-center gap-4">
          <ReactQuill
            className="h-96 w-full"
            theme="snow"
            value={content}
            onChange={setContent}
          />

          <div className="w-full flex justify-between text-sm">
            <button
              className="bg-main h-[40px] rounded-sm px-4"
              onClick={() => setCurrentScreen("home")}
            >
              Go Back
            </button>
            <button
              className="bg-main h-[40px] rounded-sm px-4"
              onClick={downloadAsPDF}
            >
              Download as PDF
            </button>
          </div>
        </div>
      </>
    );
  }
};

const HomeScreen = ({ setGeneratedDocument, setCurrentScreen }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    // Handle form submission, including sending data to the OpenAI API.
    // console.log(data);

    const endpoint = process.env.NEXT_PUBLIC_OPENAI_API_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    try {
      const response = await axios.post(
        endpoint,
        {
          prompt: `Generate documentation for the following product:
          Product Name: ${data.productName}
          Details: ${data.details}
          Software Types: ${data.softwareTypes.join(", ")}
          Additional Information: ${data.additionalInfo}
          
          Building Process:
          1. Describe the overall building process for the product.
          2. Explain the key steps involved in the development.

          Features:
          - List the key features and functionalities of the product.
          
          Technologies:
          - List the technologies and tools that will be used for development.
          - Provide details about the programming languages, frameworks, and any specific technology stack.
          
          Please generate detailed documentation that covers all the aspects mentioned above.`,

          model: "gpt-3.5-turbo-instruct",
          temperature: 0.6,
          max_tokens: 3200,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setLoading(false);
        setGeneratedDocument(response.data.choices[0]);
        setCurrentScreen("editor");
      } else {
        setError("Failed to generate document.");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError("Something Went Wrong");
    }
  };

  return (
    <>
      <form
        className="p-4 rounded-lg max-w-[600px] w-full flex flex-col gap-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* <div className="font-bold text-3xl text-[#6a8e44] text-center">Get Started</div> */}
        <div className="flex flex-col gap-2">
          <label htmlFor="productName" className="font-medium">
            Product Name
          </label>
          <input
            {...register("productName")}
            className="h-[45px] border-white outline-none focus:border-main border rounded-lg bg-transparent px-4"
            placeholder="Enter your Product Name"
          />
          <p className="text-red-600 text-xs">{errors.productName?.message}</p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="details">Details</label>
          <textarea
            {...register("details")}
            className=" border-[#f2f4f9] rounded-lg outline-none focus:border-main border bg-transparent p-4"
            rows={5}
            placeholder="give details about your Product..."
          />
          <p className="text-red-600 text-xs">{errors.details?.message}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-medium">Software Type:</p>
          <label>
            <input
              type="checkbox"
              {...register("softwareTypes")}
              value="mobile app"
              className="accent-main"
            />{" "}
            Mobile App
          </label>
          <label>
            <input
              type="checkbox"
              {...register("softwareTypes")}
              value="web app"
              className="accent-main"
            />{" "}
            Web App
          </label>
          <label>
            <input
              type="checkbox"
              {...register("softwareTypes")}
              value="native app"
              className="accent-main"
            />{" "}
            Native
          </label>
          <p className="text-red-600 text-xs">
            {errors.softwareTypes?.message &&
              "Please select at least one software type"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="additionalInfo">Additional Information</label>
          <textarea
            {...register("additionalInfo")}
            className=" border-[#f2f4f9] rounded-lg outline-none focus:border-main border bg-transparent p-4"
            rows={5}
            placeholder="got additional info, type it here..."
          />
          <p className="text-red-600 text-xs">
            {errors.additionalInfo?.message}
          </p>
        </div>

        {error && (
          <p className="bg-red-600/5 border-red-600 border p-4 text-center text-sm">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="disabled:bg-[#6a8e44] text-black font-bold hover:scale-105 duration-300 transition bg-main h-[40px] rounded-lg"
        >
          {loading ? <BeatLoader color="#fff" /> : "Generate"}
        </button>
      </form>
    </>
  );
};
