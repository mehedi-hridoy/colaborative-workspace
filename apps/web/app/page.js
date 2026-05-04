"use client";

import Link from "next/link";
import { Icons } from "../lib/icons";

export default function LandingPage() {
  const features = [
    {
      icon: Icons.Goals,
      iconBg: "bg-[#0b4f44]",
      title: "Strategic Goal Tracking",
      description: "Align every team around quarterly outcomes with milestones, owners, and live progress visibility.",
    },
    {
      icon: Icons.ActionItems,
      iconBg: "bg-[#0f172a]",
      title: "Execution That Moves",
      description: "Drag-and-drop task workflows, clear ownership, and deadline signals that keep momentum high.",
    },
    {
      icon: Icons.Announcements,
      iconBg: "bg-[#1d4ed8]",
      title: "Communication Hub",
      description: "Ship updates once and keep everyone synced with real-time announcements and team reactions.",
    },
    {
      icon: Icons.Members,
      iconBg: "bg-[#ea580c]",
      title: "Live Team Presence",
      description: "See who is online, assign by role, and coordinate work without context-switching overload.",
    },
    {
      icon: Icons.Analytics,
      iconBg: "bg-[#059669]",
      title: "Decision-Ready Insights",
      description: "Track velocity, completion trends, and team output with dashboards leaders can trust.",
    },
    {
      icon: Icons.Activity,
      iconBg: "bg-[#7c3aed]",
      title: "Instant Activity Feed",
      description: "Every goal, task, and update appears in one stream so decisions happen faster.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f2f4f8] text-black">
      {/* NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#d7dde7]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Icons.Dashboard size={20} className="text-white" />
            </div>
            <span className="text-lg font-semibold">TeamFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-base text-black hover:underline">
              Features
            </a>
            <a href="#benefits" className="text-base text-black hover:underline">
              Benefits
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-base font-medium text-black hover:underline">
              Sign In
            </Link>
            <Link href="/register" className="bg-black text-white rounded-full px-6 py-2 font-medium text-base hover:bg-[#17171c] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-[#7dd3fc]/40 blur-3xl" />
          <div className="absolute top-16 right-10 h-72 w-72 rounded-full bg-[#a7f3d0]/45 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d7dde7] bg-white/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#334155]">
            High-velocity teams ship on TeamFlow
          </p>
          <h1 className="mt-6 text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight text-[#0f172a]">
            Turn team chaos into <span className="bg-gradient-to-r from-[#111827] via-[#0b4f44] to-[#2563eb] bg-clip-text text-transparent">predictable delivery</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mt-8 mb-12 max-w-3xl mx-auto leading-relaxed">
            Plan goals, run execution, and keep every update visible in one command center. No scattered tools. No missed handoffs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12">
            <Link href="/register" className="bg-[#0f172a] text-white rounded-full px-8 py-4 font-semibold hover:bg-[#020617] transition-colors inline-flex items-center gap-2 shadow-[0_10px_30px_rgba(15,23,42,0.22)]">
              Start 14-Day Free Trial
              <Icons.ChevronRight size={20} />
            </Link>
            <a href="#benefits" className="border border-[#0f172a] rounded-full px-8 py-4 font-semibold hover:bg-[#0f172a] hover:text-white transition-colors inline-flex items-center gap-2 bg-white/80">
              See Platform Benefits
              <Icons.FileText size={20} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[#d6dde8] bg-white/85 px-5 py-4">
              <p className="text-2xl font-black text-[#0b4f44]">35%</p>
              <p className="text-sm text-slate-600">Faster sprint completion</p>
            </div>
            <div className="rounded-2xl border border-[#d6dde8] bg-white/85 px-5 py-4">
              <p className="text-2xl font-black text-[#0f172a]">3x</p>
              <p className="text-sm text-slate-600">Clearer cross-team visibility</p>
            </div>
            <div className="rounded-2xl border border-[#d6dde8] bg-white/85 px-5 py-4">
              <p className="text-2xl font-black text-[#1d4ed8]">99.9%</p>
              <p className="text-sm text-slate-600">Realtime sync uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 bg-[#eaf6e8]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter mb-20 text-center" style={{color: '#000000'}}>
            Built for teams that execute
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white/90 backdrop-blur rounded-2xl p-8 border border-[#d6dde8] shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                  <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-[#0f172a]">{feature.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-bold tracking-tight mb-12 text-black">
                Why teams choose TeamFlow
              </h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#003c33] rounded-lg flex items-center justify-center">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">Zero Learning Curve</h3>
                    <p className="text-base text-gray-800">Intuitive interface designed for humans, not robots.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#003c33] rounded-lg flex items-center justify-center">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">Real-Time Collaboration</h3>
                    <p className="text-base text-gray-800">Socket.io-powered instant updates for all team members.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#003c33] rounded-lg flex items-center justify-center">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-black">Role-Based Access</h3>
                    <p className="text-base text-gray-800">Fine-grained permissions ensure data stays secure.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#ecf3ff] to-[#ecfff7] rounded-2xl p-12 flex items-center justify-center min-h-96 border border-[#d6dde8]">
              <div className="text-center">
                <div className="w-20 h-20 bg-black rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Icons.Dashboard size={40} className="text-white" />
                </div>
                <p className="text-slate-700 font-medium">Leadership Command Center</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8 text-white">
            Join teams shipping faster
          </h2>
          <p className="text-lg text-white mb-12 leading-relaxed">
            Start collaborating today. No credit card required.
          </p>

          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-black rounded-full px-8 py-4 font-medium hover:bg-[#f2f2f2] transition-colors">
            Start Building Now
            <Icons.ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white border-t border-[#f2f2f2]/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Icons.Dashboard size={20} className="text-black" />
                </div>
                <span className="font-semibold text-white">TeamFlow</span>
              </div>
              <p className="text-sm text-white">Collaborate with clarity</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white">Product</h3>
              <ul className="space-y-2 text-sm text-white">
                <li><a href="#" className="hover:text-gray-400">Features</a></li>
                <li><a href="#" className="hover:text-gray-400">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white">Company</h3>
              <ul className="space-y-2 text-sm text-white">
                <li><a href="#" className="hover:text-gray-400">About</a></li>
                <li><a href="#" className="hover:text-gray-400">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-white">
                <li><a href="#" className="hover:text-gray-400">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-400">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#f2f2f2]/10 pt-8 text-sm text-white text-center">
            <p>&copy; 2026 TeamFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
