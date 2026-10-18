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
      <section className="signup-panel" aria-labelledby="waitlist-title">
        <div className="signup-intro">
          <h1 id="waitlist-title">Know where<br />your group’s<br />money goes.</h1>
          <p className="hero-description">With {brand.name}, your group will collect contributions through one link. Everyone can see payments in and out, and withdrawals need approval from the people you choose.</p>
        </div>
        <WaitlistForm />
        <details className="about-product">
          <summary>What we’re building <Plus size={18} aria-hidden="true" /></summary>
          <div><p>{brand.name} will give your group a link to collect contributions, a shared record of payments, and signatories who approve withdrawals.</p><p>We’re still building. Leave your email and we’ll let you know when you can try it.</p></div>
        </details>
      </section>
      <div className="photo-panel">
        <Image src="/images/community.webp" alt="Three Black friends smiling together outdoors" fill priority sizes="(max-width: 760px) 100vw, 55vw" />
        <span className="photo-wordmark" aria-hidden="true">{brand.name.toLowerCase()}.</span>
      </div>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {brand.company}</span><a href="/privacy">Privacy</a></footer>
  </div>;
}
