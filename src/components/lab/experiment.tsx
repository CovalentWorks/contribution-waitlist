import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Plus, UsersThree, Receipt } from '@phosphor-icons/react/dist/ssr';
import { Brand } from '@/components/brand';
import { WaitlistForm } from '@/components/waitlist-form';
import { brand } from '@/config';
import styles from './lab.module.css';

export function Experiment({ variant }: { variant: 'circle' | 'assembly' }) {
  const circle = variant === 'circle';
  return <div className={`${styles.experiment} ${circle ? styles.circle : styles.assembly}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={styles.header}><Brand /><Link href="/">Other concepts <ArrowUpRight size={16} /></Link><a className={styles.contact} href={`mailto:${brand.contactEmail}`}>Talk to us <ArrowUpRight size={16} /></a></header>
    <main id="main">
      <section className={styles.stage} aria-labelledby="hero-title">
        <div className={styles.titleBlock}>
          <h1 id="hero-title">Know where<br />your group’s<br /><span>money goes.</span></h1>
          <p>{brand.name} will give your group one link to collect money, a shared record of payments, and people you choose to approve withdrawals.</p>
        </div>
        <div className={styles.artwork}>
          <div className={styles.portrait}><Image src={circle ? '/images/abuja-friends.webp' : '/images/nigerian-wedding.webp'} alt={circle ? 'Five friends sitting together outdoors in Abuja, Nigeria' : 'Friends and family celebrating at a Nigerian wedding'} fill preload sizes="(max-width:600px) calc(100vw - 48px), (max-width:900px) 560px, 45vw" /></div>
          {circle && <div className={styles.photoDecorations} aria-hidden="true"><span className={styles.peopleStamp}><UsersThree size={32} weight="duotone" /></span><span className={styles.recordStamp}><Receipt size={30} weight="duotone" /></span></div>}
        </div>
        <div className={styles.signup}><WaitlistForm /></div>
      </section>
      <section className={styles.explainer} aria-labelledby="explainer-title">
        <h2 id="explainer-title">For the groups<br />you contribute to.</h2>
        <div><p>Alumni dues. Estate projects. A wedding. Something for home. If your group collects money, we’re building {brand.name} for you.</p><details><summary>What we’re building <Plus size={18} /></summary><p>A shared view of contributions in and payments out. Chosen signatories will review withdrawals before money moves. We’re still building; join the waitlist to hear when you can try it.</p></details></div>
      </section>
    </main>
    <footer className={styles.footer}><span>© {new Date().getFullYear()} {brand.company}</span><Link href="/privacy">Privacy <ArrowRight size={14} /></Link></footer>
  </div>;
}
