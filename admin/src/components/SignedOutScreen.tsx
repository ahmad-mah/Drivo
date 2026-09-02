import { SignInButton } from "@clerk/react";
import { Shield, Car, MapPin, CreditCard, Clock, Users } from "lucide-react";

export function SignedOutScreen() {
  return (
    <div className="min-h-dvh bg-bg-primary">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute -left-40 -top-24 h-125 w-150 rounded-full bg-[radial-gradient(ellipse,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-24 h-100 w-125 rounded-full bg-[radial-gradient(ellipse,rgba(56,189,248,0.07)_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10">
            <Car className="h-10 w-10 text-brand-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Drivo
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            A modern ride-hailing platform connecting riders with nearby drivers in real-time.
            Built with security, speed, and reliability at its core.
          </p>
          <div className="mt-8">
            <SignInButton mode="modal">
              <button className="rounded-xl bg-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-300 hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]">
                Sign In to Admin Dashboard
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<MapPin className="h-6 w-6" />}
            title="Real-Time Matching"
            description="Find nearby drivers instantly with GPS-powered location tracking and intelligent dispatch."
          />
          <FeatureCard
            icon={<Clock className="h-6 w-6" />}
            title="Live Navigation"
            description="Turn-by-turn navigation for drivers and real-time ride progress for riders."
          />
          <FeatureCard
            icon={<CreditCard className="h-6 w-6" />}
            title="Secure Payments"
            description="Cashless payments powered by Stripe with PCI-compliant tokenization."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Safety First"
            description="Identity verification, ride sharing, emergency assistance, and trip verification."
          />
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Multi-Role Support"
            description="Dedicated experiences for riders, drivers, and administrators with role-based access."
          />
          <FeatureCard
            icon={<Car className="h-6 w-6" />}
            title="Fleet Management"
            description="Admin dashboard for managing drivers, trips, payments, and platform analytics."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-text-secondary">
        <p>&copy; {new Date().getFullYear()} Drivo. All rights reserved.</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <a href="/privacy.html" className="hover:text-brand-400 transition-colors">
            Privacy Policy
          </a>
          <span className="text-border">|</span>
          <a href="mailto:ahmedma.dev@gmail.com" className="hover:text-brand-400 transition-colors">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-strong rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
    </div>
  );
}
