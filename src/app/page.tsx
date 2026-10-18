import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { Brand } from '@/components/brand';
import { brand } from '@/config';
import styles from '@/components/lab/lab.module.css';
export const metadata = { title: `${brand.name} · Design experiments`, robots: { index: false, follow: false } };
export default function DesignLab() {
  return <main className={styles.gallery}>
    <header><Brand /><a href="http://localhost:3035">Current local version ↗</a></header>
    <h1>Two new directions.</h1>
    <p>Separate experiments for the waitlist. Built around the visual language of Slush, Spade, Stripe and Phantom: bold type, colour and interactive 3D. Your current local page and live site are unchanged.</p>
    <div className={styles.choices}>
      <Link className={styles.choice} href="/lab/circle"><span>Sky blue · Sculptural · People first</span><h2>Circle</h2><p>Four tactile pieces form one shared circle, with a photograph of friends in Lagos at its centre.</p><span>Open Circle <ArrowUpRight size={28} /></span></Link>
      <Link className={styles.choice} href="/lab/assembly"><span>Dark ink · Lilac · Dimensional</span><h2>Assembly</h2><p>A Nigerian wedding photograph becomes the face of a 3D object assembled from individual pieces.</p><span>Open Assembly <ArrowUpRight size={28} /></span></Link>
    </div>
    <small>Local previews only. Form submissions stay in this experiment’s local database. No welcome emails are sent from these previews.</small>
  </main>;
}
