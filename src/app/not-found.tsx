import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-white text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 font-black text-2xl text-slate-950 shadow-xl mb-4">
        ZP
      </div>
      <h1 className="text-4xl font-black mb-2">404</h1>
      <h2 className="text-xl font-bold mb-4">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-amber-500 text-slate-950 font-bold text-xs"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
