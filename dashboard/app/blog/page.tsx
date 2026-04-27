import PageStub from '@/components/PageStub';

export const metadata = { title: 'Blog — ReadyPi' };

export default function BlogPage() {
  return (
    <PageStub
      eyebrow="Blog"
      title="Stories from the gateway."
      body="Engineering notes, model benchmarks, and product updates from the ReadyPi team. Posts coming soon."
      cta={{ label: 'Read the Docs', href: '/docs' }}
    />
  );
}
