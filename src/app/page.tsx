import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { Brand } from '@/components/brand';
import { brand } from '@/config';
import styles from '@/components/lab/lab.module.css';
export const metadata = { title: `${brand.name} · Design experiments`, robots: { index: false, follow: false } };
export default function DesignLab() {
  return <main className={styles.gallery}>
    <header><Brand /><a href="http://localhost:3035">Current local version ↗</a></header>
    <h1>Waitlist previews.</h1>
    <p>The latest direction uses a pale background, rust-brown accents and a simple photograph. These previews remain separate from the current local page and live site.</p>
    <div className={styles.choices}>
      <Link className={styles.choice} href="/lab/circle"><span>Pale ivory · Rust brown · Latest revision</span><h2>Friends</h2><p>Five friends in Abuja, a simple rectangular photo frame, and the bold type you chose.</p><span>Open preview <ArrowUpRight size={28} /></span></Link>
      <Link className={styles.choice} href="/lab/assembly"><span>Dark ink · Lilac · Comparison</span><h2>Assembly</h2><p>The earlier dark palette, now using a simple photograph instead of 3D objects.</p><span>Open comparison <ArrowUpRight size={28} /></span></Link>
    </div>
    <small>Local previews only. Form submissions stay in this experiment’s local database. No welcome emails are sent from these previews.</small>
  </main>;
}
