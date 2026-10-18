import { Experiment } from '@/components/lab/experiment';
import { brand } from '@/config';
export const metadata = { title: `${brand.name} concept · Circle`, robots: { index: false, follow: false } };
export default function Circle() { return <Experiment variant="circle" />; }
