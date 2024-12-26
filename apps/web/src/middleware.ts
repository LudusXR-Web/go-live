import { type NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

export const globalLanguageHeader = "x-golive-locale";
const defaultLocale = "en";
const locales = ["en", "da"];

export default function middleware(req: NextRequest) {
  // Language header for determining the locale
  const headers = {
    "accept-language": req.headers.get("accept-language") ?? defaultLocale,
  };

  const languages = new Negotiator({ headers }).languages();
  const locale = match(languages, locales, defaultLocale);

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set(
    globalLanguageHeader,
    req.cookies.get(globalLanguageHeader)?.value ?? locale,
  );

  const resOpts = {
    request: {
      headers: reqHeaders,
    },
  };

  return NextResponse.next(resOpts);
}
