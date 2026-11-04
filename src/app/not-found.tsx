import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Compass, Trophy, Ticket, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-32 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <Compass className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-semibold">
              404 — Page Not Found
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Route Off Course
            </h1>
            <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
              The page or category you are looking for does not exist or has been moved to a new route.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              asChild
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-black font-bold h-11 px-6 rounded-xl"
            >
              <Link href="/vote">
                <Trophy className="w-4 h-4 mr-2" />
                Vote Categories
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-white/20 hover:bg-white/5 text-white h-11 px-6 rounded-xl"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}

