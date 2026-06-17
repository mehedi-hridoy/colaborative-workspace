"use client";

import Link from "next/link";
import { ChevronRight, Star, Users, CheckCircle, Zap, Lock, MessageSquare, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-50 transition-colors">
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              TeamFlow
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Benefits
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Testimonials
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg px-6 py-2.5 text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:shadow-xl hover:shadow-indigo-600/30 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-4 py-2 mb-6">
                <Star size={16} className="fill-indigo-600 dark:fill-indigo-400" />
                <span className="text-sm font-semibold">Trusted by 500+ teams</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-slate-950 dark:text-white">
                Your team.{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  Better organized.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-lg">
                Centralize goals, tasks, and team updates in one calm workspace. Move faster with less noise.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg px-8 py-4 font-bold shadow-lg shadow-indigo-600/20 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  Start Free
                  <ChevronRight size={20} />
                </Link>
                <a
                  href="#demo"
                  className="flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-8 py-4 font-bold transition-all"
                >
                  Watch Demo
                  <ChevronRight size={20} />
                </a>
              </div>

              {/* Trust Signal */}
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ✓ No credit card required • ✓ Set up in 5 minutes • ✓ 14-day free trial
              </p>
            </div>

            {/* Right: Visual */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-indigo-500/20 dark:to-indigo-600/20 rounded-3xl p-8 border border-indigo-200 dark:border-indigo-800">
                <svg
                  className="w-full h-auto"
                  viewBox="0 0 400 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Collaborative Network Illustration */}
                  <circle cx="200" cy="150" r="120" fill="url(#gradient)" opacity="0.1" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>

                  {/* Central node */}
                  <circle cx="200" cy="150" r="20" fill="#4F46E5" />

                  {/* Connected nodes */}
                  <circle cx="100" cy="80" r="15" fill="#10B981" />
                  <circle cx="300" cy="80" r="15" fill="#F59E0B" />
                  <circle cx="100" cy="220" r="15" fill="#06B6D4" />
                  <circle cx="300" cy="220" r="15" fill="#8B5CF6" />

                  {/* Connection lines */}
                  <line x1="200" y1="150" x2="100" y2="80" stroke="#4F46E5" strokeWidth="2" opacity="0.3" />
                  <line x1="200" y1="150" x2="300" y2="80" stroke="#4F46E5" strokeWidth="2" opacity="0.3" />
                  <line x1="200" y1="150" x2="100" y2="220" stroke="#4F46E5" strokeWidth="2" opacity="0.3" />
                  <line x1="200" y1="150" x2="300" y2="220" stroke="#4F46E5" strokeWidth="2" opacity="0.3" />

                  {/* Icons in nodes */}
                  <text x="100" y="85" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    👥
                  </text>
                  <text x="300" y="85" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    📊
                  </text>
                  <text x="100" y="225" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    ✓
                  </text>
                  <text x="300" y="225" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    💬
                  </text>
                  <text x="200" y="155" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                    ⚡
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 bg-slate-100/50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">Core Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-950 dark:text-white">
              Built for clarity and speed
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything your team needs to align, execute, and ship—beautifully integrated in one workspace.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-950 dark:text-white">
                Goal Tracking
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Set quarterly objectives, create milestones, and track progress with real-time visibility across the entire team.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-950 dark:text-white">
                Task Management
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Organize work with Kanban boards, smart assignments, and seamless drag-and-drop workflows without context switching.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-950 dark:text-white">
                Real-Time Updates
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Stay in sync with live notifications, team activity feeds, and instant collaboration—no more status meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Benefits List */}
            <div>
              <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold">Why Teams Love TeamFlow</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-slate-950 dark:text-white">
                Work with clarity, not chaos
              </h2>

              {/* Benefits */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                      Reduce meetings by 40%
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      All context visible at a glance. No more "quick sync-ups" just to check status.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                      Ship faster
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Aligned on priorities. Dependencies visible. Blockers surface immediately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-700">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-2">
                      Onboard in days, not weeks
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Intuitive interface. Zero learning curve. Your team can be productive on day one.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                <BarChart3 className="w-12 h-12 mb-4 text-indigo-100" />
                <p className="text-5xl font-black mb-2">40%</p>
                <p className="text-lg text-indigo-100">
                  Faster project completion on average
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white shadow-lg">
                <Users className="w-12 h-12 mb-4 text-emerald-100" />
                <p className="text-5xl font-black mb-2">2000+</p>
                <p className="text-lg text-emerald-100">
                  Happy teams already using TeamFlow
                </p>
              </div>

              <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-8 text-white shadow-lg">
                <Star className="w-12 h-12 mb-4 text-violet-100" />
                <p className="text-5xl font-black mb-2">4.9/5</p>
                <p className="text-lg text-violet-100">
                  Customer satisfaction rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 px-6 bg-slate-100/50 dark:bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold">Loved by Teams</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-950 dark:text-white">
              See what teams are saying
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-lg">
                "TeamFlow transformed how we manage quarterly goals. Visibility across the engineering team increased dramatically."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">Sarah Martinez</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">VP Engineering, TechCorp</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-lg">
                "We cut our status meeting time in half. Everyone knows what matters and what's blocking them. This is game-changing."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                  JA
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">James Anderson</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Director of Product, StartupX</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed text-lg">
                "The design is beautiful, the UX is intuitive, and it just works. Our team was productive on day one. Highly recommend."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white font-bold">
                  LK
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">Lisa Kumar</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Founder, DesignStudio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl shadow-indigo-600/20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to transform your team?
            </h2>
            <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of teams using TeamFlow to ship faster, communicate better, and move with clarity.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-indigo-600 rounded-lg px-10 py-4 font-bold shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              Get Started Now — It's Free
              <ChevronRight size={20} />
            </Link>
            <p className="text-indigo-100 text-sm mt-6">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                  <Zap size={18} className="text-white" />
                </div>
                <span className="font-bold text-slate-950 dark:text-white">TeamFlow</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                The collaborative workspace for modern teams.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-slate-950 dark:text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#features" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-950 dark:text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-950 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 TeamFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                </svg>
              </a>
              <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
