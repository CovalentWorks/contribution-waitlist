import Link from 'next/link';
import { brand } from '@/config';
export function Brand() {
 return <Link className="brand" href="/" aria-label={`${brand.name} home`}><span>{brand.name.toLowerCase()}<span className="brand-dot">.</span></span></Link>;
}
