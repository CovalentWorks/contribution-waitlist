import { Brand } from '@/components/brand';
import { Unsubscribe } from '@/components/unsubscribe';
export const metadata = { title: 'Leave the waitlist', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
 const { token = '' } = await searchParams;
 return <main className="document-page"><Brand /><Unsubscribe token={token} /></main>;
}
