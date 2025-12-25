import Link from 'next/link';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-black text-ivory p-6">
      <header className="flex justify-between items-center mb-8">
        <Link href="/compass" className="text-ivory/60 hover:text-ivory">
          ← Back
        </Link>
        <h1 className="font-mono text-xl uppercase tracking-wide">Settings</h1>
        <div className="w-10" />
      </header>

      <section className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-charcoal border border-ivory/10 rounded-sm p-8 text-center max-w-md">
          <h2 className="font-mono text-2xl uppercase tracking-wide text-ivory/80 mb-4">
            Coming Soon
          </h2>
          <p className="text-ivory/50 text-sm leading-relaxed">
            Settings will allow you to configure notifications, sensitivity preferences,
            North Star goals, and account management.
          </p>
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-ivory/10 p-4 flex justify-around">
        <Link href="/compass" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Compass
        </Link>
        <Link href="/log" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Log
        </Link>
        <Link href="/insights" className="text-ivory/60 font-mono text-xs uppercase hover:text-ivory">
          Insights
        </Link>
        <Link href="/settings" className="text-orange font-mono text-xs uppercase">
          Settings
        </Link>
      </nav>
    </main>
  );
}
