import PageStub from '@/components/PageStub';

export const metadata = { title: 'Community — ReadyPi' };

export default function DiscordPage() {
  return (
    <PageStub
      eyebrow="Community"
      title="Join the developer Discord."
      body="Talk to other developers using ReadyPi. Share prompts, debug routing, and get early access to new models. Invite link coming soon."
      cta={{ label: 'Get an API Key', href: '/signup' }}
    />
  );
}
