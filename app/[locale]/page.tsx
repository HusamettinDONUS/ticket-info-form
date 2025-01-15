"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { CircleCheckBig, Send, Trash2 } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FilePicker } from "@/components/ui/filepicker";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePickerField } from "@/components/ui/datepickerfield";

export default function Page() {
  const t = useTranslations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const locale = useLocale();

  const formSchema = z.object({
    firstName: z
      .string()
      .min(1, t("validation.firstNameLength"))
      .regex(/^[A-Za-zğüşıöçĞÜŞİÖÇ]+$/, t("validation.firstName")),
    lastName: z
      .string()
      .min(1, t("validation.lastNameLength"))
      .regex(/^[A-Za-zğüşıöçĞÜŞİÖÇ]+$/, t("validation.lastName")),
    phone: z
      .string()
      .min(1, t("validation.phoneLength"))
      .regex(/^\+?[0-9]\d{1,15}$/, t("validation.phone")),
    idNumber:
      locale !== "tr"
        ? z
            .string()
            .min(1, t("validation.idNumberLength"))
            .min(6, t("validation.idNumber"))
        : z
            .string()
            .min(1, t("validation.idNumberLength"))
            .regex(
              /^[1-9][0-9]{9}[0-9]$/,
              "TC Kimlik Numarası 11 haneli olmalı"
            )
            .refine((value) => {
              const digits = value.split("").map(Number);

              const first10Sum = digits
                .slice(0, 10)
                .reduce((sum, digit) => sum + digit, 0);
              const oddSum =
                digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
              const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

              return (
                digits[9] === (oddSum * 7 - evenSum) % 10 &&
                digits[10] === first10Sum % 10
              );
            }, "Geçersiz TC Kimlik Numarası"),
    birthDate: z
      .string()
      .min(1, t("validation.birthDateLength"))
      .regex(/^\d{2}\.\d{2}\.\d{4}$/, t("validation.birthDate")),
    email: z
      .string()
      .min(1, t("validation.emailLength"))
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        t("validation.email")
      ),
    profilePicture: z.any(),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      idNumber: "",
      email: "",
      birthDate: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
          form.setValue("profilePicture", reader.result as string);
        };
        reader.onerror = () => {
          console.error("Dosya okuma hatası");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Dosya yükleme hatası:", error);
      }
    }
  };

  async function onSubmit(data: FormData) {
    try {
      setIsSubmitting(true);

      const requestBody = {
        data: {
          identityNumber: data.idNumber,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: new Date(
            data.birthDate.split(".").reverse().join("-")
          ).toISOString(),
          phoneNumber: data.phone,
          email: data.email,
          photo: data.profilePicture,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/customer/preRegistration/CreatePreRegistration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      setSubmittedData(data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="bg-white p-8 pt-4 rounded-lg shadow-lg w-96">
        <LanguageSwitcher />
        <h1 className="text-2xl text-blue-500 font-bold text-center mb-4">
          {t("form.title")}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.firstName")}</FormLabel>
                  <FormControl>
                    <Input
                      pattern="[A-Za-zğüşıöçĞÜŞİÖÇ]*"
                      onKeyDown={(e) => {
                        if (
                          ![
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "Tab",
                            "Enter",
                          ].includes(e.key) &&
                          !/^[A-Za-zğüşıöçĞÜŞİÖÇ]$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.lastName")}</FormLabel>
                  <FormControl>
                    <Input
                      pattern="[A-Za-zğüşıöçĞÜŞİÖÇ]*"
                      onKeyDown={(e) => {
                        if (
                          ![
                            "Backspace",
                            "Delete",
                            "ArrowLeft",
                            "ArrowRight",
                            "Tab",
                            "Enter",
                          ].includes(e.key) &&
                          !/^[A-Za-zğüşıöçĞÜŞİÖÇ]$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.birthDate")}</FormLabel>
                  <FormControl>
                    <DatePickerField {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.phone")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.idNumber")}</FormLabel>
                  <FormControl>
                    <Input maxLength={15} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.email")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex h-24 justify-between items-center">
              <div className="flex flex-col">
                <FormLabel>{t("form.ticketPicture")}</FormLabel>
                <FilePicker
                  type="file"
                  className="mt-1 block w-full"
                  onChange={handleFileChange}
                />
              </div>
              {imageUrl && (
                <Image
                  alt={imageUrl}
                  src={imageUrl}
                  width={75}
                  height={75}
                  objectFit="fill"
                  className="rounded-md mx-7"
                />
              )}
            </div>

            <div className="flex justify-center items-center gap-3">
              <Button
                type="submit"
                className="flex justify-center items-center w-3/5 bg-blue-500"
                disabled={isSubmitting}
              >
                <span>{t("buttons.send")}</span>
                <Send className="ml-2" />
              </Button>
              <Button
                type="button"
                className="flex justify-center items-center w-2/5 bg-red-500"
                onClick={() => {
                  form.reset();
                  setImageUrl("");
                }}
              >
                <span>{t("buttons.clear")}</span>
                <Trash2 className="ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle className="flex justify-center items-center gap-3 text-center text-xl font-bold">
              <span className="text-3xl">QR</span>
              <CircleCheckBig size={32} color="green" />
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <div
              className="relative w-64 h-64 mb-4"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <QRCodeSVG
                  value={submittedData?.idNumber || ""}
                  size={256}
                  bgColor="rgba(255, 255, 255, 0.5)"
                />
              </div>
            </div>
            <span className="font-thin">{t("form.success")}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
