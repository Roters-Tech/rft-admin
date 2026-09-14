import { RFTMark } from '@/components/layout/RFTMark';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f9ff] lg:flex">
      <section className="auth-rays relative hidden min-h-screen w-[40%] flex-col justify-between overflow-hidden px-12 py-10 lg:flex xl:px-14">
        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />
        <RFTMark />
        <div className="max-w-xl">
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/75">
            Institutional Intelligence Suite
          </div>
          <h1 className="max-w-md font-display text-[44px] font-extrabold leading-[1.08] text-white">
            Elevating Academic Excellence Through Data.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">
            A polished admin workspace for onboarding schools, managing lecturers, tracking students, and coordinating class representatives with confidence.
          </p>
          <div className="mt-10 border-l-4 border-brand-gold pl-6">
            <p className="max-w-md text-lg leading-8 text-white/80">
              Education is the most powerful weapon which you can use to change the world.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold">
              — Academic Archive
            </p>
          </div>
        </div>
        <p className="text-xs tracking-[0.18em] text-white/40">© 2025 RFT PLATFORM • V1.0.0</p>
      </section>

      <section className="flex min-h-screen w-full items-center justify-center px-0 py-0 lg:w-[60%]">
        <div className="flex min-h-screen w-full items-center justify-center px-6 py-10 lg:px-10 xl:px-16">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
