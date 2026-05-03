"use client";

import Link from "next/link";
import { Icons } from "../lib/icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e5e7eb]">
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
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl font-normal leading-none tracking-tighter mb-8">
            Collaborate with <span className="bg-gradient-to-r from-black via-[#003c33] to-black bg-clip-text text-transparent">clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-[#93939f] mb-12 max-w-2xl mx-auto leading-relaxed">
            TeamFlow brings your team together with goal tracking, real-time collaboration, and unified communication. Ship faster. Organize better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/register" className="bg-black text-white rounded-full px-8 py-4 font-medium hover:bg-[#17171c] transition-colors inline-flex items-center gap-2">
              Start Free Trial
              <Icons.ChevronRight size={20} />
            </Link>
            <a href="#demo" className="border border-black rounded-full px-8 py-4 font-medium hover:bg-black hover:text-white transition-colors inline-flex items-center gap-2">
              Watch Demo
              <Icons.FileText size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 bg-[#edfce9]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-normal tracking-tighter mb-20 text-center text-black">
            Built for modern teams
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white rounded-lg p-8 border border-[#f2f2f2]">
              <div className="w-12 h-12 bg-[#003c33] rounded-lg flex items-center justify-center mb-6">
                <Icons.Goals size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Goal Tracking</h3>
              <p className="text-base text-[#75758a] leading-relaxed">
                Set team objectives, create milestones, and track progress in real-time with granular insights.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-[#f2f2f2]">
              <div className="w-12 h-12 bg-[#071829] rounded-lg flex items-center justify-center mb-6">
                <Icons.ActionItems size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Task Management</h3>
              <p className="text-base text-[#75758a] leading-relaxed">
                Kanban boards, drag-and-drop workflow, and smart assignments keep tasks moving forward.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-[#f2f2f2]">
              <div className="w-12 h-12 bg-[#1863dc] rounded-lg flex items-center justify-center mb-6">
                <Icons.Announcements size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Communication</h3>
              <p className="text-base text-[#75758a] leading-relaxed">
                Rich-text announcements, real-time reactions, and activity feed in one place.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-[#f2f2f2]">
              <div className="w-12 h-12 bg-[#ff7759] rounded-lg flex items-center justify-center mb-6">
                <Icons.Members size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Team Presence</h3>
              <p className="text-base text-[#75758a] leading-relaxed">
                See who's online, manage permissions by role, and scale collaboration seamlessly.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-[#f2f2f2]">
              <div className="w-12 h-12 bg-[#10b981] rounded-lg flex items-center justify-center mb-6">
                <Icons.Analytics size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Analytics</h3>
              <p className="text-base text-[#75758a] leading-relaxed">
                CSV exports, goal charts, and team productivity insights at your fingertips.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 border border-[#f2f2f2]">
              <div className="w-12 h-12 bg-[#9b60aa] rounded-lg flex items-center justify-center mb-6">
                <Icons.Activity size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Real-Time Sync</h3>
              <p className="text-base text-[#75758a] leading-relaxed">
                Socket.io-powered updates ensure your team stays in sync across all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-normal tracking-tighter mb-12 text-black">
                Why teams choose TeamFlow
              </h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#003c33] rounded-lg flex items-center justify-center">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal mb-2 text-black">Zero Learning Curve</h3>
                    <p className="text-base text-[#212121]">Intuitive interface designed for humans, not robots.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#003c33] rounded-lg flex items-center justify-center">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal mb-2 text-black">Real-Time Collaboration</h3>
                    <p className="text-base text-[#212121]">Socket.io-powered instant updates for all team members.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#003c33] rounded-lg flex items-center justify-center">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal mb-2 text-black">Role-Based Access</h3>
                    <p className="text-base text-[#212121]">Fine-grained permissions ensure data stays secure.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-[#eeece7] rounded-lg p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-20 h-20 bg-black rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Icons.Dashboard size={40} className="text-white" />
                </div>
                <p className="text-[#75758a]">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-normal tracking-tighter mb-8 text-white">
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
                <li><a href="#" className="hover:text-[#93939f]">Features</a></li>
                <li><a href="#" className="hover:text-[#93939f]">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white">Company</h3>
              <ul className="space-y-2 text-sm text-white">
                <li><a href="#" className="hover:text-[#93939f]">About</a></li>
                <li><a href="#" className="hover:text-[#93939f]">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-white">
                <li><a href="#" className="hover:text-[#93939f]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#93939f]">Terms</a></li>
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
