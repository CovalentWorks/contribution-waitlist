import { Experiment } from '@/components/lab/experiment';
import { brand } from '@/config';
export const metadata = { title: `${brand.name} concept · Assembly`, robots: { index: false, follow: false } };
export default function Assembly() { return <Experiment variant="assembly" />; }
