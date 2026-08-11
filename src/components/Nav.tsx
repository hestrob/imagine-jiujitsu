import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { signOut } from "@/app/actions";

export async function Nav() {
  const user = await currentUser();
  return (
    <header className="sticky top-0 z-40 bg-mat/90 backdrop-blur border-b border-line">
      <div className="belt-line" aria-hidden />
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-display uppercase text-xl tracking-wide">
          Imagine <span className="text-flow">Jiu Jitsu</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 font-mono text-xs uppercase tracking-widest">
          <Link href="/about" className="hover:text-flow">About</Link>
          <Link href="/schedule" className="hover:text-flow">Schedule</Link>
          <Link href="/pricing" className="hover:text-flow">Pricing</Link>
          <Link href="/gallery" className="hover:text-flow">Gallery</Link>
          <Link href="/video" className="hover:text-flow">The Wall</Link>
          <Link href="/contact" className="hover:text-flow">Visit</Link>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest">
          {user ? (
            <>
              <Link href={user.role === "ADMIN" ? "/admin" : "/portal"} className="hover:text-flow">
                {user.role === "ADMIN" ? "Admin" : "My Mat"}
              </Link>
              <form action={signOut}>
                <button className="hover:text-flow">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-flow">Sign in</Link>
              <Link href="/join" className="btn !px-4 !py-2">Start</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
