import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-slate-200 mb-4">404</div>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-slate-600 text-lg">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            <button
              onClick={
                typeof window !== "undefined"
                  ? () => window.history.back()
                  : undefined
              }
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>

          {/* Search Suggestion */}
          <div className="mt-8 p-4 bg-slate-100 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <span className="text-sm font-medium text-slate-700">
                Looking for a tool?
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Try browsing our{" "}
              <Link href="/" className="text-blue-600 hover:underline">
                collection of developer tools
              </Link>
            </p>
          </div>
        </div>

        {/* Popular Tools Quick Links */}
        <div className="mt-8">
          <p className="text-sm text-slate-500 mb-3">Popular tools:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/tools/case-converter"
              className="px-3 py-1 text-xs bg-white text-slate-600 rounded-full border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              Case Converter
            </Link>
            <Link
              href="/tools/json-formatter"
              className="px-3 py-1 text-xs bg-white text-slate-600 rounded-full border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              JSON Formatter
            </Link>
            <Link
              href="/tools/url-encoder"
              className="px-3 py-1 text-xs bg-white text-slate-600 rounded-full border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              URL Encoder
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
