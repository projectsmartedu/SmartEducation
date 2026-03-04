import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

// Hero metrics displaying key platform statistics
const heroMetrics = [
    { value: '18K+', label: 'Learners onboarded' },
    { value: '92%', label: 'Average retention lift' },
    { value: '30+', label: 'Institutions served' }
];
// some ui changes
const features = [
    {
        title: 'Unified learning intelligence',
        copy: 'Bring content analytics, quiz outcomes and behavioural signals into a single, explainable profile for every learner.',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Mentor reviewing learning analytics with a student.',
        badge: 'Data fabric'
    },
    {
        title: 'Adaptive revision engine',
        copy: 'Predict forgetting risk, auto-build revision queues and deliver nudges before performance slips.',
        image: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Student revising on a tablet with digital notes.',
        badge: 'Personalised plans'
    },
    {
        title: 'Institution-ready reporting',
        copy: 'Give leadership a real-time view of cohorts, subjects and mentor performance without drowning in spreadsheets.',
        image: 'https://images.unsplash.com/photo-1517430816045-df4b7de711b4?auto=format&fit=crop&w=900&q=80',
        imageAlt: 'Faculty team discussing performance dashboards in a meeting room.',
        badge: 'Executive insight'
    }
];

const partnerNames = ['Northbridge Academy', 'BrightPath Schools', 'SkillForge Labs', 'Quantum Future Prep'];

const heroMedia = {
    dashboard: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    dashboardAlt: 'Education analytics dashboard displayed on a laptop screen in a modern workspace.'
};

// Brand logo configuration with fallback support
const brandLogo = {
    primary: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=256&q=80',
    fallback: 'https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&w=256'
};

const galleryShots = [
    {
        image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80',
        alt: 'Students collaborating in a technology-enabled classroom.',
        title: 'Collaborative classrooms',
        copy: 'Connect mentors and learners through shared progress tiles and AI-curated tasks.'
    },
    {
        image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80',
        alt: 'Teacher hosting a blended learning session with multiple devices.',
        title: 'Blended learning at scale',
        copy: 'Synchronise remote and in-person cohorts with nudges that keep progress aligned.'
    },
    {
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
        alt: 'LMS dashboards showing colourful charts and metrics.',
        title: 'Insights that drive action',
        copy: 'Surface risk, mastery and engagement signals in one command centre for leadership.'
    }
];

const featureFallbackImage = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=900';
const galleryFallbackImage = 'https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=900';
const heroFallbackImage = 'https://images.pexels.com/photos/3861957/pexels-photo-3861957.jpeg?auto=compress&cs=tinysrgb&w=1200';

// Handle image loading errors with graceful fallback
const handleImageError = (event) => {
    const img = event.currentTarget;
    const fallbackSrc = img.dataset.fallbacksrc;
    if (fallbackSrc && img.src !== fallbackSrc) {
        img.src = fallbackSrc;
        console.debug('Image fallback loaded for:', img.alt);
    } else {
        img.classList.add('landing-image-hidden');
        console.warn('Image failed to load:', img.alt);
    }
};

const floatDelayClasses = ['landing-float-delay-0', 'landing-float-delay-1', 'landing-float-delay-2'];

const testimonials = [
    {
        quote: 'We replaced weekly spreadsheet clinics with live mastery dashboards. Parents and teachers finally speak the same language.',
        name: 'Meera Kulkarni',
        role: 'Academic Coordinator, Horizon High'
    },
    {
        quote: 'Adaptive revision lifted completion rates by 2.3x. Learners stay motivated because every task has visible impact.',
        name: 'Karan Sethi',
        role: 'STEM Mentor, Nova Prep'
    },
    {
        quote: 'Rolling out to 5 campuses was painless. The team delivered integrations, onboarding and success plans in weeks.',
        name: 'Radhika Sharma',
        role: 'Director, Concept Capsule Group'
    }
];

const ctaHighlights = [
    'Live visibility into cohort health and at-risk learners',
    'White-glove onboarding, training and success support',
    'Secure, compliant architecture hosted on your preferred cloud'
];

const Landing = () => {
    useEffect(() => {
        // Skip effect on server-side rendering
        if (typeof window === 'undefined') {
            return undefined;
        }

        const cards = Array.from(document.querySelectorAll('.landing-tilt-card'));
        if (!cards.length) {
            return undefined;
        }

        // Check feature support for progressive enhancement
        const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
        const supportsIntersectionObserver = 'IntersectionObserver' in window;

        // Apply card tilt effect based on mouse position
        const handleMove = (event) => {
            const card = event.currentTarget;
            const rect = card.getBoundingClientRect();
            const relativeX = (event.clientX - rect.left) / rect.width;
            const relativeY = (event.clientY - rect.top) / rect.height;
            const rotateY = (relativeX - 0.5) * 16;
            const rotateX = (0.5 - relativeY) * 12;
            card.style.setProperty('--landing-tilt-rotateX', `${rotateX}deg`);
            card.style.setProperty('--landing-tilt-rotateY', `${rotateY}deg`);
            card.classList.add('landing-card-active');
        };

        // Reset card tilt on mouse leave
        const handleLeave = (event) => {
            const card = event.currentTarget;
            card.style.setProperty('--landing-tilt-rotateX', '0deg');
            card.style.setProperty('--landing-tilt-rotateY', '0deg');
            card.classList.remove('landing-card-active');
        };

        // Initialize intersection observer for lazy animation triggers
        let observer;
        if (supportsIntersectionObserver) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('landing-card-visible');
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.25 }
            );
        }

        cards.forEach((card) => {
            card.style.setProperty('--landing-tilt-rotateX', '0deg');
            card.style.setProperty('--landing-tilt-rotateY', '0deg');
            if (observer) {
                observer.observe(card);
            } else {
                card.classList.add('landing-card-visible');
            }
            if (supportsFinePointer) {
                card.addEventListener('pointermove', handleMove);
                card.addEventListener('pointerleave', handleLeave);
            }
        });

        // Cleanup event listeners and observers
        return () => {
            if (observer) {
                observer.disconnect();
            }
            if (supportsFinePointer) {
                cards.forEach((card) => {
                    card.removeEventListener('pointermove', handleMove);
                    card.removeEventListener('pointerleave', handleLeave);
                });
            }
        };
    }, []);

    return (
        <>
            <style>{`
                @keyframes landing-float {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    50% { transform: translate3d(0, -12px, 0); }
                }

                .landing-float-card {
                    animation: landing-float 16s ease-in-out infinite;
                    will-change: transform;
                    transform-origin: center;
                }

                .landing-float-delay-0 { animation-delay: 0s; transition-delay: 0s; }
                .landing-float-delay-1 { animation-delay: -4s; transition-delay: 0.12s; }
                .landing-float-delay-2 { animation-delay: -8s; transition-delay: 0.24s; }

                .landing-image-hidden {
                    display: none;
                }

                .landing-tilt-card {
                    --landing-tilt-rotateX: 0deg;
                    --landing-tilt-rotateY: 0deg;
                    transform: perspective(1400px) rotateX(var(--landing-tilt-rotateX)) rotateY(var(--landing-tilt-rotateY)) translate3d(0, 60px, -160px);
                    transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease, opacity 0.6s ease;
                    transform-style: preserve-3d;
                    opacity: 0;
                }

                .landing-card-visible {
                    opacity: 1;
                    transform: perspective(1400px) rotateX(var(--landing-tilt-rotateX)) rotateY(var(--landing-tilt-rotateY)) translate3d(0, 0, 0);
                }

                .landing-card-active {
                    box-shadow: 0 28px 60px -32px rgba(15, 23, 42, 0.45);
                    transform: perspective(1400px) rotateX(var(--landing-tilt-rotateX)) rotateY(var(--landing-tilt-rotateY)) translate3d(0, 0, 32px) scale(1.015);
                }
            `}</style>
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
                    <div className="absolute inset-y-0 right-0 hidden w-1/3 translate-x-1/4 rounded-full bg-indigo-200/40 blur-3xl lg:block" />
                    <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-700 shadow-xl ring-4 ring-white/40">
                                <img
                                    src={brandLogo.primary}
                                    alt="Smart Education monogram"
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    onError={handleImageError}
                                    data-fallbacksrc={brandLogo.fallback}
                                />
                                <span className="pointer-events-none absolute inset-0 rounded-3xl border border-white/15" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold tracking-tight text-slate-900">Smart Education</p>
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Knowledge Mapping Platform</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                            <Link to="/about" className="hidden rounded-full px-4 py-2 transition hover:bg-white lg:inline-flex">About</Link>
                            <Link to="/contact" className="hidden rounded-full px-4 py-2 transition hover:bg-white lg:inline-flex">Contact</Link>
                                <Link
                                    to="/login"
                                    className="rounded-full bg-slate-900 px-2 py-1 text-xs sm:px-4 sm:py-1.5 text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
                                >
                                    Sign in
                                </Link>
                        </div>
                    </nav>

                    <div className="relative z-10 mx-auto flex max-w-6xl flex-col-reverse items-center gap-12 px-6 pb-16 pt-10 md:flex-row md:items-start md:pb-20">
                        <div className="max-w-xl space-y-6">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-indigo-700">
                                AI-enabled learning operations
                            </span>
                            <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                                Bring adaptive learning, revision intelligence and cohort reporting into one strategic platform.
                            </h1>
                            <p className="text-base leading-relaxed text-slate-600">
                                Smart Education equips academic and training teams with live knowledge maps, predictive revision plans
                                and executive-ready analytics. Deliver measurable outcomes without redesigning your programmes from scratch.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                                >
                                    Request a demo
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center justify-center rounded-full border border-indigo-200 px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-white"
                                >
                                    Explore platform
                                </a>
                            </div>
                            <div className="pt-6">
                                <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Trusted by outcome-driven teams</p>
                                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
                                    {partnerNames.map((name) => (
                                        <span key={name} className="uppercase tracking-[0.12em] text-slate-500">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4 pt-8 sm:grid-cols-3">
                                {heroMetrics.map((metric) => (
                                    <div key={metric.label} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                                        <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full max-w-md pt-4 pb-20 md:pt-8">
                            <div className="landing-float-card landing-float-delay-0 relative rounded-[38px] border border-slate-900/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-2 shadow-[0_45px_90px_-45px_rgba(30,41,59,0.75)]">
                                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/20">
                                    <img
                                        src={heroMedia.dashboard}
                                        alt={heroMedia.dashboardAlt}
                                        className="h-80 w-full object-cover"
                                        loading="lazy"
                                        onError={handleImageError}
                                        data-fallbacksrc={heroFallbackImage}
                                    />
                                </div>
                                <div className="absolute -bottom-12 left-8 right-8 rounded-[28px] bg-gradient-to-br from-white via-white to-slate-100 p-6 text-slate-900 shadow-[0_35px_90px_-40px_rgba(30,41,59,0.55)]">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-400">Live cohort overview</p>
                                    <div className="mt-5 grid gap-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800">Average mastery</span>
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 shadow-inner shadow-emerald-100">68% -> 74%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800">At-risk learners</span>
                                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 shadow-inner shadow-amber-100">12 flagged</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-slate-800">Weekly logins</span>
                                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 shadow-inner shadow-indigo-100">83% engaged</span>
                                        </div>
                                    </div>
                                    <p className="mt-5 text-xs leading-relaxed text-slate-500">
                                        Securely unify LMS, assessment and attendance data into one actionable workspace.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="space-y-20 pb-24">
                    <section id="features" className="mx-auto max-w-6xl px-6">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Built for measurable academic outcomes</h2>
                            <p className="mt-3 text-base text-slate-600">
                                Each module is battle-tested with schools, universities and workforce academies operating at scale.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {features.map((feature, index) => {
                                const delayClass = floatDelayClasses[index % floatDelayClasses.length];
                                return (
                                    <article
                                        key={feature.title}
                                        className={`landing-tilt-card ${delayClass} flex h-full flex-col rounded-[24px] border border-indigo-100 bg-white p-6 shadow-sm transition hover:shadow-xl`}
                                    >
                                        <div className="overflow-hidden rounded-2xl border border-indigo-50 bg-indigo-100/60">
                                            <img
                                                src={feature.image}
                                                alt={feature.imageAlt}
                                                className="h-40 w-full object-cover"
                                                loading="lazy"
                                                onError={handleImageError}
                                                data-fallbacksrc={featureFallbackImage}
                                            />
                                        </div>
                                        <span className="mt-4 inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600">
                                            {feature.badge}
                                        </span>
                                        <h3 className="mt-3 text-xl font-semibold text-slate-900">{feature.title}</h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.copy}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6">
                        <div className="rounded-[32px] bg-gradient-to-br from-white to-indigo-50 p-8 shadow-xl">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">See Smart Education in action</h2>
                                <p className="mt-3 text-base text-slate-600">
                                    Blend the right imagery, guidance and analytics to deliver consistent learning experiences across campuses.
                                </p>
                            </div>
                            <div className="mt-10 grid gap-6 md:grid-cols-3">
                                {galleryShots.map((shot, index) => {
                                    const delayClass = floatDelayClasses[index % floatDelayClasses.length];
                                    return (
                                        <article
                                            key={shot.title}
                                            className={`landing-tilt-card ${delayClass} flex h-full flex-col rounded-[24px] border border-indigo-100 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:shadow-2xl`}
                                        >
                                            <div className="overflow-hidden rounded-2xl">
                                                <img
                                                    src={shot.image}
                                                    alt={shot.alt}
                                                    className="h-44 w-full object-cover"
                                                    loading="lazy"
                                                    onError={handleImageError}
                                                    data-fallbacksrc={galleryFallbackImage}
                                                />
                                            </div>
                                            <h3 className="mt-4 text-lg font-semibold text-slate-900">{shot.title}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{shot.copy}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6">
                        <div className="rounded-[32px] bg-white p-8 shadow-xl">
                            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr),minmax(0,1fr)] md:items-center">
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Designed for academic leaders</h2>
                                    <p className="text-base leading-relaxed text-slate-600">
                                        Smart Education adapts to your delivery model -- hybrid, in-person or remote -- while honouring existing
                                        curriculum structures and assessment policies.
                                    </p>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />Automated data pipelines from SIS, LMS and assessment tools</li>
                                        <li className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />Role-based access for mentors, academic heads and leadership</li>
                                        <li className="flex items-start gap-3"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />Audit trails, privacy controls and enterprise-grade security</li>
                                    </ul>
                                </div>
                                <div className="rounded-[28px] border border-indigo-100 bg-indigo-50 p-6 text-indigo-900">
                                    <h3 className="text-lg font-semibold">Operational highlights</h3>
                                    <dl className="mt-4 space-y-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <dt>Implementation timeline</dt>
                                            <dd className="font-semibold">4-6 weeks</dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt>Change management</dt>
                                            <dd className="font-semibold">Dedicated success partner</dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt>Integrations</dt>
                                            <dd className="font-semibold">Canvas, Moodle, Google, Microsoft 365 & more</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Trusted by forward-thinking institutions</h2>
                            <p className="mt-3 text-base text-slate-600">
                                Teams across K-12, higher education and corporate academies use Smart Education to orchestrate outcomes.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-6 md:grid-cols-3">
                            {testimonials.map((item) => (
                                <article key={item.name} className="landing-tilt-card h-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                                    <p className="text-sm leading-relaxed text-slate-600">"{item.quote}"</p>
                                    <div className="mt-6">
                                        <p className="text-base font-semibold text-slate-900">{item.name}</p>
                                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{item.role}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mx-auto max-w-6xl px-6">
                        <div className="rounded-[32px] bg-slate-900 p-10 text-white shadow-2xl">
                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div className="max-w-2xl space-y-3">
                                    <h2 className="text-2xl font-semibold sm:text-3xl">Ready to modernise your learner experience?</h2>
                                    <p className="text-sm text-white/80">
                                        Partner with Smart Education to launch adaptive learning journeys, operational dashboards and cohesive
                                        analytics -- without disrupting your academic calendar.
                                    </p>
                                    <ul className="space-y-2 text-sm text-white/80">
                                        {ctaHighlights.map((highlight) => (
                                            <li key={highlight} className="flex items-start gap-3">
                                                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-300" />
                                                <span>{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-3 text-sm font-semibold">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-slate-900 shadow-lg transition hover:-translate-y-0.5"
                                    >
                                        Talk to our team
                                    </Link>
                                    <a
                                        href="mailto:partnerships@smarteducation.ai"
                                        className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-white transition hover:bg-white/10"
                                    >
                                        partnerships@smarteducation.ai
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default Landing;
