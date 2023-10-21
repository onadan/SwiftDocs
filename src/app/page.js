"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup
  .object({
    productName: yup.string().required(),
    details: yup.string().required(),
    softwareTypes: yup
      .array()
      .of(yup.string())
      .min(1, "Please select at least one software type"),
    additionalInfo: yup.string(),
  })
  .required();

  console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY)

export default function Home() {
  // const handleSubmitIdea = () => {}
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    // Handle form submission, including sending data to the OpenAI API.
    console.log(data);
    // Replace the console.log with your OpenAI integration logic.
  };
  return (
    <main className="flex min-h-screen h-full w-full justify-center p-5">
      <div className="h-full pt-20 w-full flex flex-col items-center justify-center">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-5xl font-semibold text-main text-center">
            SwiftDocs
          </h1>
          <p className="italic">Product System Documentation Made Easy!</p>
        </div>


        <form className="p-4 rounded-lg  max-w-[600px] w-full mt-20 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        {/* <div className="font-bold text-3xl text-[#6a8e44] text-center">Get Started</div> */}
          <div className="flex flex-col gap-2">
            <label htmlFor="productName" className="font-medium">Product Name</label>
            <input {...register("productName")} className="h-[45px] border-white outline-none focus:border-main border rounded-lg bg-transparent px-4" placeholder="Enter your Product Name"/>
            <p className="text-red-600 text-xs">{errors.productName?.message}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="details">Details</label>
            <textarea {...register("details")} className=" border-[#f2f4f9] rounded-lg outline-none focus:border-main border bg-transparent p-4" rows={5} placeholder="give details about your Product..."/>
            <p className="text-red-600 text-xs">{errors.details?.message}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p  className="font-medium">Software Type:</p>
            <label>
              <input
                type="checkbox"
                {...register("softwareTypes")}
                value="mobile"
                className="accent-main"
              />{" "}
              Mobile
            </label>
            <label>
              <input
                type="checkbox"
                {...register("softwareTypes")}
                value="app"
                className="accent-main"
              />{" "}
              App
            </label>
            <label>
              <input
                type="checkbox"
                {...register("softwareTypes")}
                value="native"
                className="accent-main"
              />{" "}
              Native
            </label>
            <p className="text-red-600 text-xs">{errors.softwareTypes?.message}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea {...register("additionalInfo")} className=" border-[#f2f4f9] rounded-lg outline-none focus:border-main border bg-transparent p-4" rows={5} placeholder="got additional info, type it here..."/>
            <p className="text-red-600 text-xs">{errors.additionalInfo?.message}</p>
          </div>
          <button type="submit" className="disabled:bg-[#6a8e44] bg-main h-[40px] rounded-lg">Generate</button>
        </form>
      </div>
    </main>
  );
}
