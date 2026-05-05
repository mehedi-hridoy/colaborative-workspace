"use client";

import Link from "next/link";
import { Icons } from "../lib/icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center shadow-sm shadow-slate-950/15">
              <Icons.Dashboard size={20} className="text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-950">TeamFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
              Benefits
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
              Sign In
            </Link>
            <Link href="/register" className="bg-slate-950 text-white rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm shadow-slate-950/15 transition-all hover:-translate-y-0.5 hover:bg-slate-800">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
            Collaborative workspace for modern teams
          </p>
          <h1 className="text-6xl md:text-8xl font-semibold leading-[0.95] tracking-tight mb-8 text-slate-950">
            Work together with <span className="bg-gradient-to-r from-slate-950 via-slate-700 to-slate-950 bg-clip-text text-transparent">clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-8">
            TeamFlow keeps goals, tasks, and team updates in one calm workspace so your team can move faster with less noise.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/register" className="bg-slate-950 text-white rounded-full px-8 py-4 font-semibold shadow-lg shadow-slate-950/15 hover:bg-slate-800 hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
              Start free
              <Icons.ChevronRight size={20} />
            </Link>
            <a href="#demo" className="border border-slate-300 bg-white rounded-full px-8 py-4 font-semibold text-slate-700 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all inline-flex items-center gap-2">
              Watch demo
              <Icons.FileText size={20} />
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            No credit card required. Set up in minutes.
          </p>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 mb-4">Core capabilities</p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-950">
              Built for teams that need clarity
            </h2>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto leading-8">
              Every section is designed to reduce friction, keep work visible, and help people understand what matters right now.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-slate-950/15">
                <Icons.Goals size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-950">Goal tracking</h3>
              <p className="text-base text-slate-600 leading-7">
                Set team objectives, create milestones, and track progress in real time with granular insight.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-slate-950/15">
                <Icons.ActionItems size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-950">Task management</h3>
              <p className="text-base text-slate-600 leading-7">
                Kanban boards, drag-and-drop workflow, and smart assignments keep work moving without extra overhead.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-blue-600/20">
                <Icons.Announcements size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-950">Communication</h3>
              <p className="text-base text-slate-600 leading-7">
                Rich announcements, real-time reactions, and the activity feed live in one place.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-orange-500/20">
                <Icons.Members size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-950">Team presence</h3>
              <p className="text-base text-slate-600 leading-7">
                See who is online, manage permissions by role, and scale collaboration without confusion.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-emerald-500/20">
                <Icons.Analytics size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-950">Analytics</h3>
              <p className="text-base text-slate-600 leading-7">
                CSV exports, goal charts, and team productivity insights are always easy to find.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200/80 shadow-sm">
              <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-violet-500/20">
                <Icons.Activity size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-950">Real-time sync</h3>
              <p className="text-base text-slate-600 leading-7">
                Socket.io-powered updates keep every device in sync the moment work changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 mb-4">
                Why teams choose TeamFlow
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12 text-slate-950 leading-tight">
                A simpler way to stay aligned and move faster
              </h2>
              <ul className="space-y-8">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-slate-950 rounded-lg flex items-center justify-center shadow-sm shadow-slate-950/15">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-950">Less context switching</h3>
                    <p className="text-base text-slate-600 leading-7">Everything you need to execute lives in one place, so work stays focused.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-slate-950 rounded-lg flex items-center justify-center shadow-sm shadow-slate-950/15">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-950">Faster team decisions</h3>
                    <p className="text-base text-slate-600 leading-7">Real-time updates make it easier to move from discussion to action.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-slate-950 rounded-lg flex items-center justify-center shadow-sm shadow-slate-950/15">
                    <Icons.Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-950">Clear ownership</h3>
                    <p className="text-base text-slate-600 leading-7">Permissions and assignees make responsibilities obvious across the team.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200/80 p-12 flex items-center justify-center min-h-96 shadow-sm">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-950 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-slate-950/15">
                  <Icons.Dashboard size={40} className="text-white" />
                </div>
                <p className="text-slate-500 font-medium">Dashboard preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 bg-slate-950 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/75 mb-4">
            Ready to move faster?
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-8 text-white leading-tight">
            Bring your team into one shared rhythm
          </h2>
          <p className="text-lg text-slate-300 mb-12 leading-8 max-w-2xl mx-auto">
            Start collaborating today with one workspace for goals, tasks, and updates. No credit card required.
          </p>

          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-slate-950 rounded-full px-8 py-4 font-semibold shadow-lg shadow-black/20 hover:bg-slate-100 hover:-translate-y-0.5 transition-all">
            Start building now
            <Icons.ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-slate-700 border-t border-slate-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center shadow-sm shadow-slate-950/15">
                  <Icons.Dashboard size={20} className="text-white" />
                </div>
                <span className="font-semibold text-slate-950">TeamFlow</span>
              </div>
              <p className="text-sm text-slate-500">Collaborate with clarity</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-950">Product</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-950">Features</a></li>
                <li><a href="#" className="hover:text-slate-950">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-950">Company</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-950">About</a></li>
                <li><a href="#" className="hover:text-slate-950">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-slate-950">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-950">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-950">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-sm text-slate-500 text-center">
            <p>&copy; 2026 TeamFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
