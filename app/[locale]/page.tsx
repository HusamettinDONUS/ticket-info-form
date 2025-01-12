"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, Send, Trash2 } from "lucide-react";

export default function Page() {
  const t = useTranslations();

  const formSchema = z.object({
    firstName: z.string().min(2, t("validation.firstName")),
    lastName: z.string().min(2, t("validation.lastName")),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, t("validation.phone")),
    idNumber: z.string().min(1, t("validation.idNumber")),
    birthDate: z.date({
      required_error: t("validation.birthDate"),
    }),
    email: z.string().email(t("validation.email")),
    profilePicture: z.any(),
  });

  type FormData = z.infer<typeof formSchema>;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setValue("profilePicture", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
    setSubmittedData(data);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="h-full bg-gray-100 flex items-center justify-center">
        <div className="bg-white mt-8 p-8 rounded-lg shadow-md w-96">
          <LanguageSwitcher />
          <h1 className="text-2xl text-blue-500 font-bold text-center mb-4">
            {t("form.title")}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-md font-large text-gray-700">
                {t("form.firstName")}
              </label>
              <Input
                {...register("firstName")}
                className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm "
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("form.lastName")}
              </label>
              <Input
                {...register("lastName")}
                className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("form.phone")}
              </label>
              <Input
                {...register("phone")}
                className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm "
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("form.idNumber")}
              </label>
              <Input
                {...register("idNumber")}
                className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm "
              />
              {errors.idNumber && (
                <p className="text-red-500 text-sm">
                  {errors.idNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("form.birthDate")}
              </label>
              <DatePicker
                value={watch("birthDate")}
                onChange={(date) => {
                  setValue("birthDate", date!, {
                    shouldValidate: true,
                  });
                }}
              />
              {errors.birthDate && (
                <p className="text-red-500 text-sm">
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("form.email")}
              </label>
              <Input
                {...register("email")}
                className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm "
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("form.ticketPicture")}
              </label>
              <Input
                type="file"
                className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm "
                onChange={handleFileChange}
              />
            </div>

            <div className="flex justify-center items-center gap-3">
              <Button
                type="submit"
                className="flex justify-center items-center w-3/5 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                <span>{t("buttons.send")}</span>
                <Send size={32} />
              </Button>
              <Button
                type="button"
                className="flex justify-center items-center w-2/5 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200"
                onClick={() => {
                  reset();
                  setImageUrl("");
                }}
              >
                <span>{t("buttons.clear")}</span>
                <Trash2 size={32} />
              </Button>
            </div>
          </form>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-fit">
            <DialogHeader>
              <DialogTitle className="flex justify-center items-center gap-3 text-center text-xl font-bold">
                <span className="text-3xl">QR</span>
                <CircleCheckBig size={32} color="green" />
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center ">
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
                    bgColor="rgba(255, 255, 255, 0.1)"
                  />
                </div>
              </div>
              <span className="font-thin">{t("form.success")}</span>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
