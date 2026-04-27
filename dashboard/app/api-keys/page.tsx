import PageStub from '@/components/PageStub';

export const metadata = { title: 'API Keys — ReadyPi' };

export default function ApiKeysPage() {
  return (
    <PageStub
      eyebrow="API Keys"
      title="Manage your keys from the dashboard."
      body="Sign in to create, rotate, and revoke API keys. Each key is scoped to a workspace and can have its own monthly BDT spend limit."
      cta={{ label: 'Open Dashboard', href: '/dashboard' }}
    />
  );
}
