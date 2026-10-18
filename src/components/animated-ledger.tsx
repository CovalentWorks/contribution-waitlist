'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, HouseLine, ShieldCheck } from '@phosphor-icons/react';
import { brand } from '@/config';
import styles from '@/styles/animated-ledger.module.css';

// Fictional amounts, names and approvals. No payment or customer data is used.
const steps = [
  { balance: 180000, caption: 'One place for everyone’s contributions.' },
  { balance: 220000, caption: 'Chiamaka adds her contribution.' },
  { balance: 250000, caption: 'Tunde adds his contribution. Everyone can see it.' },
  { balance: 250000, caption: 'A payment is requested for Chinedu the mechanic.' },
  { balance: 250000, caption: 'Ngozi approves. One more approval needed.' },
  { balance: 250000, caption: 'Emeka approves. The payment can go ahead.' },
  { balance: 200000, caption: '₦50,000 paid. The record updates for everyone.' },
];
const money = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

export function AnimatedLedger() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setStep(6);
    };
    const visibility = () => setVisible(!document.hidden);
    update(); visibility();
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || !visible) return;
    const timer = setTimeout(() => setStep(current => (current + 1) % steps.length), step === 6 ? 5000 : 2800);
    return () => clearTimeout(timer);
  }, [step, reducedMotion, visible]);

  const paid = step === 6;
  const approvalCount = step >= 5 ? 2 : step === 4 ? 1 : 0;
  const contributions = [
    ...(step >= 2 ? [{ name: 'Tunde A.', initials: 'TA', amount: 30000, tone: 'gold' }] : []),
    ...(step >= 1 ? [{ name: 'Chiamaka O.', initials: 'CO', amount: 40000, tone: 'rose' }] : []),
    { name: 'Ngozi E.', initials: 'NE', amount: 30000, tone: 'clay' },
  ];

  return <section className={styles.preview} aria-label="Animated example of group contributions" data-step={step}>
    <div className={styles.canvas}>
      <div className={styles.topline}><span className={styles.wordmark}>{brand.name.toLowerCase()}.</span></div>
      <div className={styles.account}>
        <div className={styles.group}><span className={styles.groupIcon}><HouseLine size={23} weight="duotone" /></span><div><strong>Fix generator for estate security</strong><span>Metro Lagos Estate · 20 members</span></div><span className={styles.shared}><ShieldCheck size={18} /> Shared</span></div>
        <div className={styles.balance}><span>Group balance</span><strong key={steps[step].balance}>{money(steps[step].balance)}<small>.00</small></strong></div>
        <div className={styles.totals}><span><ArrowDownLeft size={16} /> In <b>{money(paid ? 250000 : steps[step].balance)}</b></span><span><ArrowUpRight size={16} /> Out <b>{paid ? '₦50,000' : '₦0'}</b></span></div>
        <div className={styles.activityTitle}><h2>Activity</h2><span>Visible to everyone</span></div>
        <div className={styles.transactions}>
          {paid && <div className={styles.row} key="payment"><span className={`${styles.avatar} ${styles.outgoing}`}><ArrowUpRight size={20} /></span><div><strong>Chinedu · Mechanic</strong><span>Approved by Ngozi & Emeka</span></div><b className={styles.debit}>−₦50,000</b></div>}
          {contributions.map(person => <div className={styles.row} key={person.name}><span className={`${styles.avatar} ${styles[person.tone]}`}>{person.initials}</span><div><strong>{person.name}</strong><span>Contribution received</span></div><b>+{money(person.amount)}</b></div>)}
        </div>
        <div className={`${styles.approval} ${step >= 3 ? styles.requested : ''}`}>
          <div className={styles.requestHeading}><span><ShieldCheck size={17} /> {paid ? 'Payment completed' : step >= 3 ? 'Withdrawal request' : 'Shared approvals'}</span><b>{paid ? <Check size={18} weight="bold" /> : step >= 3 ? '₦50,000' : '2 required'}</b></div>
          <p>{step >= 3 ? 'Generator repairs · Pay Chinedu the mechanic' : 'Payments need your chosen people’s approval.'}</p>
          <div className={styles.approvers}>{['Ngozi', 'Emeka'].map((name, index) => <span key={name} className={approvalCount > index ? styles.approved : ''}><span>{approvalCount > index ? <Check size={13} weight="bold" /> : name[0]}</span>{name}<small>{approvalCount > index ? 'Approved' : 'Waiting'}</small></span>)}</div>
        </div>
      </div>
      <div className={styles.notification} key={step}><span className={styles.notificationIcon}>{paid ? <Check size={19} weight="bold" /> : step >= 3 ? <ShieldCheck size={21} /> : <ArrowDownLeft size={22} />}</span><p>{steps[step].caption}</p></div>
    </div>
    <div className={styles.progress} aria-hidden="true">{steps.map((_, index) => <span key={index} className={index <= step ? styles.complete : ''} />)}</div>
  </section>;
}
