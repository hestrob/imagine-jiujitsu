import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { signOut } from "@/app/actions";

export async function Nav() {
  const user = await currentUser();
  const navLinks = [
    ["/about", "About"],
    ["/schedule", "Schedule"],
    ["/pricing", "Pricing"],
    ["/gallery", "Gallery"],
    ["/video", "The Wall"],
    ["/contact", "Visit"],
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-line shadow-sm">
      {/* Top Academy Ribbon */}
      <div className="bg-ink text-mat/80 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-crimson-bright" />
              2548 Allen Cir, Woodland, CA
            </span>
            <span className="hidden sm:inline text-mat/30">|</span>
            <a href="tel:5305203266" className="hidden sm:inline hover:text-white transition-colors">
              (530) 520-3266
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-mat/90 font-semibold">First Week Free</span>
            <span className="text-mat/30">·</span>
            <Link href="/pricing" className="text-crimson-bright hover:underline font-semibold">
              $60/mo Unlimited
            </Link>
          </div>
        </div>
      </div>

      <div className="belt-line" aria-hidden />

      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="group flex items-center gap-3 shrink-0" aria-label="Imagine Jiu Jitsu Academy Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-seal-circle.png"
            alt="Imagine Jiu Jitsu Woodland Seal"
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-full border border-line shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-script-dark.png"
            alt="Imagine Jiu Jitsu Academy"
            className="h-9 sm:h-11 w-auto object-contain"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-6 font-mono text-xs uppercase tracking-widest font-bold text-ink/80">
          {navLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="relative py-1 hover:text-crimson transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-crimson after:transition-all hover:after:w-full"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
          {user ? (
            <>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/portal"}
                className="border border-ink/20 bg-mat px-3 py-2 font-bold hover:border-crimson hover:text-crimson transition-colors"
              >
                {user.role === "ADMIN" ? "Admin Console" : "My Mat"}
              </Link>
              <form action={signOut}>
                <button className="text-ink/70 hover:text-crimson px-2 py-1">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block font-bold text-ink/80 hover:text-crimson px-2 py-1">
                Sign in
              </Link>
              <Link href="/contact" className="btn !px-4 !py-2.5 !text-xs">
                Free Class
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <div className="flex lg:hidden items-center gap-4 overflow-x-auto border-t border-line/70 bg-mat/60 px-4 py-2 font-mono text-[11px] uppercase tracking-widest font-bold">
        {navLinks.map(([href, label]) => (
          <Link key={href} href={href} className="shrink-0 text-ink/80 hover:text-crimson">
            {label}
          </Link>
        ))}
        {!user && (
          <Link href="/login" className="shrink-0 sm:hidden text-flow hover:underline ml-auto">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

