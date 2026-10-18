import type { Metadata } from 'next';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/archivo';
import './globals.css';
import { brand } from '@/config';
export const metadata: Metadata = {
 metadataBase: new URL(process.env.SITE_URL || process.env.URL || 'http://localhost:3035'),
 title: `${brand.name} | Group contributions`, description: brand.description,
 openGraph: { title: `${brand.name} | Group contributions`, description: brand.description, type: 'website', images: ['/images/community-email.jpg'] },
 twitter: { card: 'summary_large_image', title: brand.name, description: brand.description, images: ['/images/community-email.jpg'] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="en"><body>{children}</body></html>;
}
