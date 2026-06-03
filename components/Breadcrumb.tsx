import Link from 'next/link';
import JsonLd from './JsonLd';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const allItems = [{ name: 'Головна', href: '/' }, ...items];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://cca.thevibe.works${item.href}`,
    })),
  };

  return (
    <>
      <JsonLd data={schema} />
      <nav className="breadcrumb" aria-label="Навігаційний ланцюжок">
        {allItems.map((item, i) => (
          <span key={item.href} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && <span>›</span>}
            {i === allItems.length - 1
              ? <span style={{ color: 'var(--ink)' }}>{item.name}</span>
              : <Link href={item.href}>{item.name}</Link>
            }
          </span>
        ))}
      </nav>
    </>
  );
}
