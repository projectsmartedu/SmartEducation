import React from 'react';
import { Link } from 'react-router-dom';

const heroStats = [
    { label: 'Students on platform', value: '18K+' },
    { label: 'Concepts mapped', value: '140K+' },
    { label: 'Revision boosts', value: '48%' }
];

const featureCards = [
    {
        title: 'Personalized Knowledge Map',
        blurb: 'Navigate a visual concept graph with mastery colours and prerequisite alerts so learners know exactly where to focus.',
        image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80',
        icon: '🧠'
    },
    {
        title: 'Adaptive Revision Table',
        blurb: 'AI predicts forgetting curves, schedules smart revision sessions and flags concepts that need urgent attention.',
        image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=80',
        icon: '📅'
    },
    {
        title: 'Weakness Heatmap',
        blurb: 'A colour-coded heatmap highlights fragile concepts and knowledge gaps so every study sprint is laser focused.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
        icon: '🔥'
    },
    {
        title: 'Learning Pace Adjustment',
        blurb: 'The engine auto-tunes difficulty and workload by reading how quickly each learner moves through activities.',
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
        icon: '⏱️'
    },
    {
        title: 'Gamified Progression',
        blurb: 'Earn XP, collect mastery streaks and level up skills with delightful micro-animations that keep motivation high.',
        image: 'https://images.unsplash.com/photo-1600267165477-5b4e64fef91c?auto=format&fit=crop&w=800&q=80',
        icon: '🎮'
    },
    {
        title: 'PDF → Animated Learning',
        blurb: 'Upload static PDFs and watch the platform generate animated explainers and interactive cards in seconds.',
        image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=800&q=80',
        icon: '🚀'
    },
    {
        title: 'Doubt Resolution Support',
        blurb: 'A dedicated AI mentor responds instantly with clarifications, examples and follow-up prompts for deeper mastery.',
        image: 'https://images.unsplash.com/photo-1587613864531-5d31a936e6ef?auto=format&fit=crop&w=800&q=80',
        icon: '💡'
    }
];

const systemFlow = [
    {
        step: 'Study Sessions',
        details: 'Learners explore lessons, immersive explainers and adaptive quizzes on any device.',
        image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=600&q=80'
    },
    {
        step: 'Active Demonstrations',
        details: 'Students attempt quizzes, submit concept explainers or record quick reflections.',
        image: 'https://images.unsplash.com/photo-1610484826967-09c5720778d9?auto=format&fit=crop&w=600&q=80'
    },
    {
        step: 'ML Insight Layer',
        details: 'Graph neural networks and temporal models score proficiency, pace and concept fragility.',
        image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=600&q=80'
    },
    {
        step: 'Knowledge Map Refresh',
        details: 'Nodes light up, prerequisites unlock and mastery rings adjust in real time.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=600&q=80'
    },
    {
        step: 'Adaptive Plan Generated',
        details: 'A revision playlist with reminders, mixed difficulty and spaced repetition appears instantly.',
        image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80'
    }
];

const mlHighlights = [
    {
        title: 'Graph Neural Network Engine',
        copy: 'Understands prerequisite pathways, concept influence and peer similarities to update the knowledge map.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=640&q=80'
    },
    {
        title: 'Time-Based Forgetting Predictor',
        copy: 'Captures study cadence to forecast retention decay and trigger timely revision nudges.',
        image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=640&q=80'
    },
    {
        title: 'Sequence Pace Estimator',
        copy: 'Reads clickstream sequences to recommend the ideal mix of difficulty, duration and modality.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=640&q=80'
    }
];

const benefits = [
    'Hyper-personalised learning journeys for every learner',
    'Higher retention through adaptive revision and spaced practice',
    'Early detection of knowledge gaps before assessments',
    'Institution-ready architecture with cohort level insights',
    'Decisions driven by explainable machine learning pipelines'
];

const testimonials = [
    {
        quote:
            'The knowledge map makes parent meetings effortless. We show exactly where each child stands and what comes next.',
        name: 'Meera Kulkarni',
        role: 'Academic Coordinator, Horizon High'
    },
    {
        quote:
            'Our revision completion rates jumped 2.5x in six weeks thanks to adaptive scheduling and streak rewards.',
        name: 'Karan Sethi',
        role: 'STEM Mentor, Nova Prep'
    },
    {
        quote:
            'Uploading PDFs and receiving animated explainers is a game changer that keeps students hooked.',
        name: 'Ananya Rao',
        role: 'Founder, Concept Capsule'
    }
];

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#f7f3ef] text-[#111827]">
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(100,116,255,0.16),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_45%)]" />
                <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1e293b] text-[#f7f3ef] shadow-lg">
                            <span className="text-lg font-semibold">PK</span>
                        </div>
                        <div>
                            <p className="text-xl font-semibold tracking-tight">Personalized Knowledge Mapping</p>
                            <p className="text-xs uppercase tracking-[0.28em] text-[#475569]">
                                Adaptive Revision Engine
                            </p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4 text-sm font-semibold">
                        <Link
                            to="/login"
                            className="rounded-full border border-[#334155]/40 px-5 py-2 text-[#334155] transition hover:border-[#1e293b] hover:text-[#1e293b]"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-full bg-[#3b82f6] px-5 py-2 text-[#f7f3ef] shadow-lg shadow-[#3b82f6]/40 transition hover:bg-[#2563eb]"
                        >
                            Launch platform
                        </Link>
                    </div>
                </nav>

                <section className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-12 lg:grid-cols-[minmax(0,1.05fr),minmax(0,0.95fr)] lg:pb-32">
                    <div className="flex flex-col gap-10">
                        <div className="space-y-6">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[#334155]">
                                AI-built for adaptive mastery
                            </span>
                            <h1 className="text-4xl font-bold leading-tight text-[#0f172a] sm:text-5xl">
                                Personalized Knowledge Mapping & Adaptive Revision Engine
                            </h1>
                            <p className="max-w-xl text-base text-[#334155] sm:text-lg">
                                An ML-driven platform that models every learner’s knowledge graph, predicts forgetting, and delivers live revision plans so progress never falls through the cracks.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/login"
                                className="rounded-full bg-[#4338ca] px-6 py-3 text-base font-semibold text-[#f8fafc] shadow-xl shadow-[#4338ca]/35 transition hover:-translate-y-1 hover:bg-[#312e81]"
                            >
                                Start Learning Smarter
                            </Link>
                            <Link
                                to="/student-showcase"
                                className="rounded-full border border-[#4338ca]/40 px-6 py-3 text-base font-semibold text-[#312e81] transition hover:border-[#4338ca] hover:text-[#4338ca]"
                            >
                                View Knowledge Map
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {heroStats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-3xl border border-[#475569]/15 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                >
                                    <p className="text-2xl font-semibold text-[#1e293b]">{stat.value}</p>
                                    <p className="text-xs uppercase tracking-[0.28em] text-[#475569]">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80"
                                alt="Students collaborating with AI insights"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent p-6 text-[#f8fafc]">
                                <p className="text-sm uppercase tracking-[0.28em] text-white/70">Live overlay</p>
                                <h3 className="text-lg font-semibold">AI detects fragile concepts in real-time</h3>
                                <p className="mt-2 text-sm text-white/80">
                                    Knowledge nodes and revision schedules update the moment a student completes an activity.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </header>

            <section className="mx-auto flex max-w-5xl flex-col gap-12 rounded-[32px] bg-[#ece6f4] px-8 py-16 shadow-lg">
                <div className="grid gap-10 md:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)] md:items-center">
                    <div className="space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4c1d95]">Why this matters</p>
                        <h2 className="text-3xl font-semibold text-[#1f2937]">
                            Traditional e-learning treats every learner the same.
                        </h2>
                        <p className="text-base leading-relaxed text-[#374151]">
                            Static modules, identical quizzes and rigid schedules leave students disengaged, unsure of what to revise and blind to hidden knowledge gaps. Educators are left guessing who needs help until assessments arrive.
                        </p>
                        <div className="rounded-2xl bg-white/80 p-6 shadow-md">
                            <h3 className="text-xl font-semibold text-[#1f2937]">Our solution</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#374151]">
                                Personalized Knowledge Mapping & Adaptive Revision Engine reimagines learning as a living system. Every response feeds ML models that grow each learner’s map, recommend next best actions, and keep everyone moving forward with confidence.
                            </p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-[28px] bg-white shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
                            alt="Illustration of adaptive learning journey"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#818cf8]/30 to-transparent" />
                    </div>
                </div>
            </section>

            <section className="mx-auto mt-20 max-w-6xl px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4338ca]">Core system features</p>
                    <h2 className="mt-4 text-3xl font-semibold text-[#1e293b]">
                        Every component works together to keep learners ahead of forgetting.
                    </h2>
                </div>
                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featureCards.map((feature) => (
                        <article
                            key={feature.title}
                            className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#c7d2fe]/60 bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            <div className="relative">
                                <img src={feature.image} alt={feature.title} className="h-44 w-full object-cover" />
                                <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/90 text-lg shadow-sm">
                                    {feature.icon}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col gap-4 p-6">
                                <h3 className="text-xl font-semibold text-[#1f2937]">{feature.title}</h3>
                                <p className="text-sm leading-relaxed text-[#475569]">{feature.blurb}</p>
                                <Link
                                    to="/login"
                                    className="mt-auto text-sm font-semibold text-[#4338ca] transition group-hover:text-[#312e81]"
                                >
                                    Learn more →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto mt-24 max-w-6xl rounded-[32px] bg-[#e3eef9] px-8 py-16 shadow-lg">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1d4ed8]">How the system works</p>
                    <h2 className="mt-4 text-3xl font-semibold text-[#0f172a]">
                        Machine learning loops that learn with every interaction.
                    </h2>
                </div>
                <div className="mt-12 grid gap-8 md:grid-cols-5">
                    {systemFlow.map((item, index) => (
                        <div key={item.step} className="relative flex flex-col items-center text-center">
                            <div className="relative h-40 w-full overflow-hidden rounded-[24px] shadow-md">
                                <img src={item.image} alt={item.step} className="h-full w-full object-cover" />
                                <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-sm font-semibold text-[#1d4ed8] shadow">
                                    {index + 1}
                                </span>
                            </div>
                            <div className="mt-4 space-y-2">
                                <h3 className="text-lg font-semibold text-[#0f172a]">{item.step}</h3>
                                <p className="text-sm leading-relaxed text-[#475569]">{item.details}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto mt-24 max-w-6xl px-6">
                <div className="rounded-[32px] bg-[#f2e8e9] p-8 shadow-lg">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] lg:items-center">
                        <div className="space-y-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#be123c]">Machine learning & intelligence</p>
                            <h2 className="text-3xl font-semibold text-[#1f2937]">
                                Explainable models craft every knowledge journey.
                            </h2>
                            <div className="grid gap-5">
                                {mlHighlights.map((highlight) => (
                                    <div key={highlight.title} className="flex gap-4 rounded-2xl bg-white/80 p-4 shadow">
                                        <img
                                            src={highlight.image}
                                            alt={highlight.title}
                                            className="h-20 w-20 rounded-2xl object-cover"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#1f2937]">{highlight.title}</h3>
                                            <p className="text-sm text-[#475569]">{highlight.copy}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-[28px] bg-white shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80"
                                alt="AI intelligence visual"
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#be123c]/30 to-transparent" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto mt-24 max-w-6xl px-6">
                <div className="rounded-[32px] bg-white p-8 shadow-xl">
                    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr),minmax(0,1fr)] md:items-center">
                        <div className="space-y-6">
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#0f172a]">Benefits</p>
                            <h2 className="text-3xl font-semibold text-[#111827]">Why leaders choose Personalized Knowledge Mapping.</h2>
                            <ul className="grid gap-3 text-sm text-[#374151]">
                                {benefits.map((benefit) => (
                                    <li key={benefit} className="flex items-start gap-3 rounded-2xl bg-[#f3f4f6] p-3">
                                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#4338ca]" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative overflow-hidden rounded-[28px] bg-[#e2e8f0] p-8">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=80"
                                alt="Collaborative learning benefits"
                                className="h-full w-full rounded-2xl object-cover"
                            />
                            <div className="absolute inset-0 rounded-[28px] border border-white/60" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto mt-24 max-w-6xl px-6">
                <div className="rounded-[32px] bg-[#e8ecf8] p-8 shadow-xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1d4ed8]">Testimonials & use cases</p>
                        <h2 className="mt-4 text-3xl font-semibold text-[#0f172a]">Loved by students, mentors and institutions.</h2>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {testimonials.map((item) => (
                            <article key={item.name} className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-lg">
                                <p className="text-sm leading-relaxed text-[#334155]">“{item.quote}”</p>
                                <div className="mt-6">
                                    <p className="text-base font-semibold text-[#0f172a]">{item.name}</p>
                                    <p className="text-xs uppercase tracking-[0.28em] text-[#475569]">{item.role}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="mt-24 bg-[#e2e8f0]">
                <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#111827]">PKM Adaptive</h3>
                        <p className="text-sm text-[#475569]">
                            Personalized Knowledge Mapping & Adaptive Revision Engine delivers the future of AI-driven learning journeys.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#111827]">Product</h4>
                        <ul className="mt-4 space-y-2 text-sm text-[#475569]">
                            <li><Link to="/" className="hover:text-[#111827]">Knowledge map</Link></li>
                            <li><Link to="/" className="hover:text-[#111827]">Adaptive revision</Link></li>
                            <li><Link to="/" className="hover:text-[#111827]">Gamified journeys</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#111827]">Company</h4>
                        <ul className="mt-4 space-y-2 text-sm text-[#475569]">
                            <li><Link to="/about" className="hover:text-[#111827]">About</Link></li>
                            <li><Link to="/contact" className="hover:text-[#111827]">Contact</Link></li>
                            <li><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#111827]">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-[#111827]">Connect</h4>
                        <div className="mt-4 flex gap-3">
                            {['https://twitter.com', 'https://linkedin.com', 'https://youtube.com'].map((link) => (
                                <a
                                    key={link}
                                    href={link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1f2937] shadow transition hover:-translate-y-1 hover:bg-[#f8fafc]"
                                >
                                    •
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/60 bg-[#d8dee9] py-4 text-center text-xs uppercase tracking-[0.3em] text-[#475569]">
                    © {new Date().getFullYear()} Personalized Knowledge Mapping. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Landing;
