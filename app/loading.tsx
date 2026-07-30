import { BookOpen, GraduationCap } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-blue-500/20" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-green-600 shadow-lg shadow-blue-600/20">
            <GraduationCap className="h-8 w-8 text-white" strokeWidth={2.25} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-800">
          <BookOpen className="h-4 w-4 animate-pulse text-blue-600" />
          <span className="text-sm font-medium tracking-wide text-slate-600">
            Loading Akilix…
          </span>
        </div>

        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/3 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-600 via-green-600 to-amber-500 bg-[length:200%_100%]" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
