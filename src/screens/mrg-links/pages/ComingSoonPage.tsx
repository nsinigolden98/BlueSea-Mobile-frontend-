import { useLocation } from 'react-router-dom';
import { Code2, Globe2, GitBranch, MessageCircle, Sparkles, Users } from 'lucide-react';
import { ComingSoonPanel, PageHeading } from '../components/MrGPrimitives';

const content: Record<string, { title: string; description: string; features: string[]; icon: typeof Globe2 }> = {
  domains: { title: 'Domain marketplace & DNS management', description: 'Discover, purchase and manage domains for your brand, then configure DNS and connect a branded short-link domain without leaving MrG Links.', features: ['Search available domains', 'Purchase and renew domains', 'DNS record management', 'SSL and domain verification', 'Connect branded short domains'], icon: Globe2 },
  api: { title: 'Developer API', description: 'Connect MrG Links to your own website, application or workflow. Create links programmatically and receive verified link and analytics events.', features: ['API key management', 'Link creation endpoints', 'Webhook events', 'Usage and rate limits', 'Developer documentation'], icon: Code2 },
  teams: { title: 'Team collaboration', description: 'Bring your marketing and operations teams into one workspace with roles, permissions, shared campaigns and activity history.', features: ['Invite team members', 'Role-based permissions', 'Shared link folders', 'Campaign ownership', 'Workspace audit trail'], icon: Users },
  whatsapp: { title: 'WhatsApp smart links', description: 'Create tracked WhatsApp entry points with pre-filled messages, campaign attribution and a smooth hand-off into a conversation.', features: ['Click-to-chat links', 'Pre-filled messages', 'Campaign attribution', 'QR code pairing', 'Conversation entry insights'], icon: MessageCircle },
  'ab-testing': { title: 'A/B destination testing', description: 'Compare two or more landing-page destinations using controlled traffic splits. Measure the outcomes and choose the strongest performer when conversion tracking is connected.', features: ['Create destination variants', 'Set traffic allocation', 'Compare click and conversion outcomes', 'Pause or end a test', 'Review experiment history'], icon: GitBranch },
  ai: { title: 'AI link assistant', description: 'Turn link performance into clear next steps. The assistant will summarise campaign outcomes, identify unusual traffic patterns and recommend practical improvements.', features: ['Campaign summaries', 'Traffic anomaly signals', 'Content and alias suggestions', 'Performance recommendations', 'Natural-language reports'], icon: Sparkles },
};

export default function ComingSoonPage() {
  const location = useLocation();
  const key = location.pathname.split('/').filter(Boolean).at(-1) || 'domains';
  const item = content[key] || content.domains;
  return <><PageHeading eyebrow="Product roadmap" title="A bigger toolkit is on the way." description="These capabilities are part of the MrG Links roadmap. We are reserving their place now so the product can grow without changing its core navigation."/><ComingSoonPanel title={item.title} description={item.description} features={item.features}/></>;
}
