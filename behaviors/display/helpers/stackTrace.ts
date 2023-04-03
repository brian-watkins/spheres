import { Page } from "playwright";

function hostForPage(page: Page): string {
  const url = new URL(page.url())
  return `${url.protocol}//${url.host}`
}

export function fixStackTraceForPage(page: Page, line: string): string {
  return fixStackTrace(hostForPage(page), line)
}

export function fixStackTrace(host: string, line: string): string {
  return line.replaceAll(host, '')
}
