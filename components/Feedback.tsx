"use client";
import React, { useState } from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { CircleDashedIcon, MessageCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { apiCall } from "@/lib/api";

const items = [
  {
    id: "IMPROVEMENT",
    label: "Improvement 👍",
  },
  {
    id: "INTEGRATION",
    label: "Integrations 🔗",
  },
  {
    id: "STYLING",
    label: "Styling 🎨",
  },
  {
    id: "MISC",
    label: "Misc 🤷",
  },
  {
    id: "BUG",
    label: "Bug Report 🐛",
  },
  {
    id: "FEATURE",
    label: "Feature Request 🚀",
  },
] as const;

const Feedback = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formSchema = z.object({
    title: z.string().min(1, {
      message: "Please write a short title",
    }),
    description: z.string().max(500, {
      message: "Please write a description less than 500 characters",
    }),
    type: z.array(z.string()),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: [],
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);
    const data = await apiCall("POST", "/api/feedback", values);
    if (data.success) {
      toast.success(data.msg);
      form.reset();
    } else {
      toast.error(data.msg);
    }
    setIsLoading(false);
  }
  return (
    <Drawer direction="right">
      <DrawerTrigger className="group fixed bottom-5 right-5 flex h-12 items-center rounded-full bg-gradient-to-r from-primary to-secondary px-3 text-white">
        <MessageCircle className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden transition-all duration-500 ease-linear group-hover:max-w-xs">
          <span className="pl-2"></span>
          Feedback
        </span>
      </DrawerTrigger>
      <DrawerContent className="left-auto right-0 top-0 mt-0 h-screen max-w-[400px] sm:px-5">
        <DrawerHeader>
          <DrawerTitle>Found a bug or need a feature to be added?</DrawerTitle>
          <DrawerDescription>
            Let us know and we will do the same.
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col p-4"
          >
            <div className="flex-1 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="title">Title:</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        id="title"
                        placeholder="Your problem or idea in a few words"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description:</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Why your Idea is useful, who would benefit and how it should work?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <p className="text-sm font-medium dark:text-white">
                        Choose up to 3 Topics for this Idea (optional)
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {items.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="type"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex w-max flex-row items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <div>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      id={item.id}
                                      onCheckedChange={(checked) => {
                                        if (
                                          checked &&
                                          form.getValues("type").length < 3
                                        ) {
                                          field.onChange([
                                            ...field.value,
                                            item.id,
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id,
                                            ),
                                          );
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={item.id}
                                      className={`cursor-pointer rounded-full border px-2 py-1 text-xs ${form.getValues("type").includes(item.id) ? "border-primary text-primary" : "border-borderColour dark:border-borderColour-dark"}`}
                                    >
                                      {item.label}
                                    </label>
                                  </div>
                                </FormControl>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DrawerFooter>
              <div className="flex gap-3">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    size={"lg"}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button type="submit" className="flex-1" size={"lg"}>
                  {isLoading && (
                    <CircleDashedIcon className="h-6 w-6 animate-spin stroke-white transition-colors duration-500" />
                  )}{" "}
                  Submit
                </Button>
              </div>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};

export default Feedback;
