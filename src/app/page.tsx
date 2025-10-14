'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Users, BarChart3, Clock, Shield, ChevronRight, CheckCircle2, Star,} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const HRISLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pricingMode, setPricingMode] = useState('package');

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  

  useEffect(() => {
  gsap.utils.toArray('.animate-on-scroll').forEach((elem) => {
    const el = elem as HTMLElement;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 100 },
      {
        duration: 0.3,
        autoAlpha: 1,
        y: 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 100%',
          end: 'bottom 10%', 
          toggleActions: 'play reverse play reverse', 
          // markers: true,
        },
      }
    );
  });
  // Floating bounce animation remains the same
  gsap.to('.floating-badge', {
    y: -10,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
    duration: 1.5,
  });
  // Pricing cards hover scale effect remains the same
  const cards = gsap.utils.toArray('.pricing-card');
  cards.forEach((card) => {
    const el = card as HTMLElement;
    const onEnter = () => gsap.to(el, { scale: 1, duration: 0.1, ease: 'power1.out' });
    const onLeave = () => gsap.to(el, { scale: 1, duration: 0.1, ease: 'power1.out' });
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    // Cleanup function to remove event listeners on unmount
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  });
}, [pricingMode]);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Employee Management",
      description: "Kelola data karyawan dengan mudah dan efisien dalam satu platform terpadu",
      color: "from-[#257047] to-[#1e5a38]"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Time & Attendance",
      description: "Tracking kehadiran real-time dengan sistem absensi digital yang akurat",
      color: "from-[#FFAB00] to-[#e69900]"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Dashboard analytics untuk monitoring performa dan produktivitas tim",
      color: "from-[#C11D0A] to-[#a01708]"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Payroll System",
      description: "Otomasi penggajian dengan keamanan data tingkat enterprise",
      color: "from-[#2D8EFF] to-[#1a75e6]"
    }
  ];

  const stats = [
    { value: "10+", label: "Active Users" },
    { value: "500+", label: "Companies" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Manager",
      company: "Tech Corp",
      content: "HRIS telah mengubah cara kami mengelola SDM. Efisiensi meningkat 70%!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "CEO",
      company: "Startup Inc",
      content: "Platform terbaik untuk mengelola tim remote. Sangat direkomendasikan!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A5F] to-[#7CA5BF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">HR</span>
              </div>
              <span className="text-xl font-bold text-[#1E3A5F]">HRIS Pro</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#1E3A5F] transition-colors">Features</a>
              {/* <a href="#solutions" className="text-gray-700 hover:text-[#1E3A5F] transition-colors">Solutions</a> */}
              <a href="#pricing" className="text-gray-700 hover:text-[#1E3A5F] transition-colors">Pricing</a>
              <Link href="/auth" className="inline-block px-6 py-2 bg-gradient-to-r from-[#1E3A5F] to-[#7CA5BF] text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all">
                Login
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-700">Features</a>
              {/* <a href="#solutions" className="block text-gray-700">Solutions</a> */}
              <a href="#pricing" className="block text-gray-700">Pricing</a>
              <button className="w-full px-6 py-2 bg-gradient-to-r from-[#1E3A5F] to-[#7CA5BF] text-white rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll opacity-0 translate-x-[-50px] transition-all duration-1000 hero-text">
              <div className="inline-block px-4 py-2 bg-[#BA3C54]/10 text-[#BA3C54] rounded-full text-sm font-semibold mb-6">
                ✨ Next Generation HRIS Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1E3A5F] mb-6 leading-tight">
                Transformasi
                <span className="block bg-gradient-to-r from-[#257047] to-[#FFAB00] bg-clip-text text-transparent">
                  HR Digital
                </span>
                Dimulai Di Sini
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Kelola seluruh aspek HR dengan platform all-in-one yang powerful, mudah, dan terintegrasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-[#1E3A5F] to-[#7CA5BF] text-white rounded-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center group">
                  Mulai Gratis
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border-2 border-[#1E3A5F] text-[#1E3A5F] rounded-lg hover:bg-[#1E3A5F] hover:text-white transition-all">
                  Lihat Demo
                </button>
              </div>
              <div className="mt-8 flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#257047]" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#257047]" />
                  <span>No credit card</span>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll opacity-0 translate-x-[50px] transition-all duration-1000 delay-300 relative hero-image">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F] to-[#7CA5BF] rounded-3xl transform rotate-3 opacity-20"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:rotate-1 transition-transform duration-500">
                  <div className="space-y-6">
                    {/* Dashboard Preview */}
                    <div className="bg-gradient-to-br from-[#1E3A5F] to-[#7CA5BF] rounded-2xl p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm opacity-80">Dashboard Overview</span>
                        <div className="flex gap-2">
                          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-3xl font-bold mb-2">1,247</div>
                      <div className="text-sm opacity-80">Total Employees</div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-[#257047] to-[#1e5a38] rounded-xl p-4 text-white">
                        <div className="text-2xl font-bold">98.5%</div>
                        <div className="text-xs opacity-80">Attendance Rate</div>
                      </div>
                      <div className="bg-gradient-to-br from-[#FFAB00] to-[#e69900] rounded-xl p-4 text-white">
                        <div className="text-2xl font-bold">156</div>
                        <div className="text-xs opacity-80">Leave Requests</div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Performance Reviews</span>
                          <span>85%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#C11D0A] to-[#a01708] w-[85%] rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Training Completion</span>
                          <span>92%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#2D8EFF] to-[#1a75e6] w-[92%] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-[#BA3C54] text-white rounded-2xl p-4 shadow-lg floating-badge">
                <div className="text-xs font-semibold">New Updates</div>
                <div className="text-2xl font-bold">+24</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-[#1E3A5F] to-[#7CA5BF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
              Fitur Lengkap untuk <span className="bg-gradient-to-r from-[#257047] to-[#FFAB00] bg-clip-text text-transparent">HR Modern</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua tools yang Anda butuhkan untuk mengelola HR dengan lebih efektif dan efisien
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700 hover:scale-105"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all h-full border-2 border-transparent hover:border-[#7CA5BF]/30">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1E3A5F] mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <button className="mt-6 text-[#1E3A5F] font-semibold flex items-center group-hover:gap-2 transition-all">
                    Learn More
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
              HRIS Pricing Plans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the plan that best suits your business! This HRIS offers both subscription and pay-as-you-go payment options, available in the following packages
            </p>
            
            {/* Toggle Switch */}
            <div className="inline-flex items-center bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setPricingMode('package')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  pricingMode === 'package' ? 'bg-[#595959] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Package
              </button>
              <button
                onClick={() => setPricingMode('seat')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  pricingMode === 'seat' ? 'bg-[#595959] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Seat
              </button>
            </div>
          </div>

                    {/* Conditional Rendering for Pricing Cards */}
          {pricingMode === 'package' ? (
            // Package Pricing Cards
            <div className="grid md:grid-cols-3 gap-8">
              {/* Standard Plan */}
              <div className="pricing-card animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700 delay-100">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 h-full border-2 border-gray-200 hover:border-[#7CA5BF] hover:shadow-xl transition-all">
                  <div className="text-sm text-gray-500 mb-2">Nama Paket</div>
                  <div className="text-4xl font-bold text-gray-400 mb-1">Rp Harga</div>
                  <div className="text-sm text-gray-500 mb-4">/ user/ month</div>
                  <p className="text-gray-600 mb-6">Deskripsi jumlah karyawan yang bisa menggunakan</p>
                  <button className="w-full py-3 bg-[#595959] text-white rounded-lg font-medium hover:bg-[#1E3A5F] transition-all mb-8">Upgrade Paket →</button>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">List fitur</span></div>
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">GPS based attendance system</span></div>
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">Employee data management</span></div>
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">Leave & time-off requests</span></div>
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">Overtime management</span></div>
                  </div>
                </div>
              </div>

              {/* Premium Plan - Featured */}
              <div className="pricing-card animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700 delay-200 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#FFAB00] to-[#e69900] text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
                <div className="bg-gradient-to-br from-[#595959] to-[#1E3A5F] rounded-3xl p-8 h-full shadow-2xl transform scale-105 hover:scale-110 transition-all">
                  <div className="text-sm text-white/70 mb-2">Premium</div>
                  <div className="text-4xl font-bold text-white mb-1">Rp Harga</div>
                  <div className="text-sm text-white/70 mb-4">/ user/ month</div>
                  <p className="text-white/80 mb-6">Best for growing business</p>
                  <button className="w-full py-3 bg-white text-[#1E3A5F] rounded-lg font-medium hover:bg-gray-100 transition-all mb-8">Select a Package →</button>
                  <div className="border-t border-white/20 mb-6"></div>
                  <div className="text-white/90 font-semibold mb-4">All Standard Features</div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Clock-in & clock-out attendance settings</span></div>
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Fingerprint integration</span></div>
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Employee document management</span></div>
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Sick leave & time-off settings</span></div>
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Task management</span></div>
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Comprehensive reports</span></div>
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Overtime management</span></div>
                    <div className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5" /> <span className="text-sm">Reimbursement & custom regulations</span></div>
                  </div>
                </div>
              </div>

              {/* Ultra Plan */}
              <div className="pricing-card animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700 delay-300">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 h-full border-2 border-gray-200 hover:border-[#7CA5BF] hover:shadow-xl transition-all">
                  <div className="text-sm text-gray-500 mb-2">Ultra</div>
                  <div className="text-4xl font-bold text-gray-400 mb-1">Rp Harga</div>
                  <div className="text-sm text-gray-500 mb-4">/ user/ month</div>
                  <p className="text-gray-600 mb-6">Deskripsi jumlah karyawan yang bisa menggunakan</p>
                  <button className="w-full py-3 bg-[#595959] text-white rounded-lg font-medium hover:bg-[#1E3A5F] transition-all mb-8">Select a Package →</button>
                  <div className="border-t border-gray-300 mb-6"></div>
                  <div className="text-gray-900 font-semibold mb-4">All Premium Features</div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">Face recognition</span></div>
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">Automated check-out attendance</span></div>
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">Employee turnover dashboard</span></div>
                    <div className="flex items-center gap-3 text-gray-700"><CheckCircle2 className="w-5 h-5 text-gray-400" /> <span className="text-sm">Custom dashboard for statistics & analysis</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Seat Pricing Cards
            <div className="grid md:grid-cols-3 gap-8">
              {/* Standard Seat */}
              <div className="pricing-card animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700 delay-100">
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#7CA5BF] hover:shadow-xl transition-all h-full">
                  <div className="text-sm text-gray-500 mb-2">STANDARD</div>
                  <div className="text-5xl font-bold text-gray-800 mb-1">Rp 15.000</div>
                  <div className="text-sm text-gray-500 mb-4">/ user/ month</div>
                  <p className="text-gray-600 mb-6">This package for 1 until 50 employee</p>
                  <button className="w-full py-3 bg-[#595959] text-white rounded-lg font-medium hover:bg-[#1E3A5F] transition-all">Upgrade Paket →</button>
                </div>
              </div>

              {/* Premium Seat */}
              <div className="pricing-card animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700 delay-200">
                <div className="bg-white rounded-2xl p-8 border-2 border-[#1E3A5F] shadow-lg hover:shadow-2xl transition-all h-full">
                  <div className="text-sm text-[#1E3A5F] mb-2 font-semibold">PREMIUM</div>
                  <div className="text-5xl font-bold text-[#1E3A5F] mb-1">Rp 12.000</div>
                  <div className="text-sm text-gray-500 mb-4">/ user/ month</div>
                  <p className="text-gray-600 mb-6">This package for 51 until 100 employee</p>
                  <button className="w-full py-3 bg-[#1E3A5F] text-white rounded-lg font-medium hover:bg-[#7CA5BF] transition-all">Upgrade Paket →</button>
                </div>
              </div>

              {/* Ultra Seat */}
              <div className="pricing-card animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700 delay-300">
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-[#7CA5BF] hover:shadow-xl transition-all h-full">
                  <div className="text-sm text-gray-500 mb-2">ULTRA</div>
                  <div className="text-5xl font-bold text-gray-800 mb-1">Rp 19.000</div>
                  <div className="text-sm text-gray-500 mb-4">/ user/ month</div>
                  <p className="text-gray-600 mb-6">This package for 1 until 50 employee</p>
                  <button className="w-full py-3 bg-[#595959] text-white rounded-lg font-medium hover:bg-[#1E3A5F] transition-all">Upgrade Paket →</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
              Dipercaya oleh <span className="bg-gradient-to-r from-[#BA3C54] to-[#C11D0A] bg-clip-text text-transparent">500+ Perusahaan</span>
            </h2>
            <p className="text-xl text-gray-600">Apa kata mereka tentang HRIS Pro</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="animate-on-scroll opacity-0 translate-y-[30px] transition-all duration-700"
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#FFAB00] text-[#FFAB00]" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A5F] to-[#7CA5BF] rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[#1E3A5F]">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#1E3A5F] via-[#7CA5BF] to-[#1E3A5F] rounded-3xl p-12 text-center shadow-2xl animate-on-scroll opacity-0 scale-95 transition-all duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Transformasi HR Anda?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan perusahaan yang telah merasakan kemudahan mengelola HR dengan HRIS Pro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-white text-[#1E3A5F] rounded-lg font-bold hover:shadow-2xl transform hover:scale-105 transition-all">
                Coba Gratis 14 Hari
              </button>
              <button className="px-10 py-4 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-[#1E3A5F] transition-all">
                Hubungi Sales
              </button>
            </div>
            <p className="text-white/70 text-sm mt-6">Tidak perlu kartu kredit • Setup dalam 5 menit</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E3A5F] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7CA5BF] to-white rounded-lg flex items-center justify-center">
                  <span className="text-[#1E3A5F] font-bold text-xl">HR</span>
                </div>
                <span className="text-xl font-bold">HRIS Pro</span>
              </div>
              <p className="text-white/70">Platform HRIS terdepan untuk perusahaan modern</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/70">
            <p>© 2025 HRIS Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .animate-on-scroll {
          /* Initial state handled by GSAP */
        }
      `}</style>
    </div>
  );
};

export default HRISLanding;
