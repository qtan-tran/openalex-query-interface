export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
            OA
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">
            OpenAlex Explorer
          </span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-4">
          <a
            href="https://docs.openalex.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            API docs
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
