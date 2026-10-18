import Image from 'next/image';
import { ArrowUpRight, Plus } from '@phosphor-icons/react/dist/ssr';
import { Brand } from '@/components/brand';
import { WaitlistForm } from '@/components/waitlist-form';
import { brand } from '@/config';

export default function Home() {
  return <div className="landing">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><Brand /><a href={`mailto:${brand.contactEmail}`}>Talk to us <ArrowUpRight size={16} /></a></header>
    <main id="main" className="waitlist-layout">
      <h1 id="waitlist-title">Know where your group’s money goes.</h1>
      <div className="photo-panel">
        <Image src="/images/family-gathering.webp" alt="A Black family preparing a meal together around a table" fill preload sizes="(max-width: 760px) 100vw, 57vw" />
      </div>
      <section className="signup-panel" aria-labelledby="waitlist-title">
        <p className="hero-description">With {brand.name}, your group will collect through one link, see payments in and out, and choose who approves withdrawals.</p>
        <WaitlistForm />
      </section>
      <details className="about-product">
        <summary>What we’re building <Plus size={18} aria-hidden="true" /></summary>
        <div><p>{brand.name} will give your group a link to collect contributions, a shared record of payments, and signatories who approve withdrawals. For alumni dues, estate projects, family plans, and the other things your group contributes to.</p><p>We’re still building. Leave your email and we’ll let you know when you can try it.</p></div>
      </details>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {brand.company}</span><a href="/privacy">Privacy</a></footer>
  </div>;
}
