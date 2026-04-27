import DocPage from '@/components/DocPage';

export const metadata = { title: 'Contact — ReadyPi' };

export default function ContactPage() {
  return (
    <DocPage
      eyebrow="Contact"
      title="Talk to the team."
      intro="One inbox per topic. We respond within one business day, usually faster."
      sections={[
        {
          heading: 'General questions',
          body: (
            <p><a href="mailto:hello@readypi.io" className="text-[#ff6b4a] underline">hello@readypi.io</a> — partnerships, press, hiring, anything else.</p>
          ),
        },
        {
          heading: 'Technical support',
          body: (
            <p><a href="mailto:support@readypi.io" className="text-[#ff6b4a] underline">support@readypi.io</a> — broken integrations, billing questions, model availability. Include your account email and a request ID if you have one.</p>
          ),
        },
        {
          heading: 'Security disclosures',
          body: (
            <p><a href="mailto:security@readypi.io" className="text-[#ff6b4a] underline">security@readypi.io</a> — vulnerabilities, abuse reports. Please don't file public issues for security bugs.</p>
          ),
        },
        {
          heading: 'Legal & privacy',
          body: (
            <p><a href="mailto:legal@readypi.io" className="text-[#ff6b4a] underline">legal@readypi.io</a> · <a href="mailto:privacy@readypi.io" className="text-[#ff6b4a] underline">privacy@readypi.io</a> — DSAR requests, account deletion, contracts.</p>
          ),
        },
        {
          heading: 'Office',
          body: (
            <p>Rareware Studio · Sylhet, Bangladesh 🇧🇩</p>
          ),
        },
      ]}
    />
  );
}
