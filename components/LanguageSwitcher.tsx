"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export const defaultLocale = "tr";
export const locales = ["tr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export default function LanguageSwitcher() {
  const router = useRouter();

  return (
    <div className="flex gap-12 mb-4 justify-center">
      {locales.map((lang) => (
        <button
          key={lang}
          onClick={() => router.push(`/${lang}`)}
          className={"rounded h-fit w-fit"}
        >
          <Image src={`/${lang}.png`} alt={lang} width={75} height={25} />
        </button>
      ))}
    </div>
  );
}
