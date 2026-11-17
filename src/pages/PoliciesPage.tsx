import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();

  const policyData: Record<string, { title: string; subtitle: string; content: string[] }> = {
    terms: {
      title: 'Terms of Service (Draft / Placeholder)',
      subtitle: 'Guidelines governing the Selloi community marketplace',
      content: [
        '1. Direct Marketplace: Selloi operates as a technology discovery platform connecting independent Indian creators and small businesses directly with buyers.',
        '2. Indie Authenticity: Sellers must represent genuine, small-batch, handmade, customized, or curated independent products.',
        '3. Fulfillment Accountability: Sellers are responsible for safely packing and fulfilling direct customer orders within their stated lead times.',
        '4. User Conduct: Hate speech, copyright infringement, and unauthorized dropshipping of mass factory goods are strictly prohibited.'
      ]
    },
    privacy: {
      title: 'Privacy Policy (Draft / Placeholder)',
      subtitle: 'How Selloi treats your personal and shipping data',
      content: [
        '1. Data Collection: We collect only the contact and address details necessary to dispatch orders to creator studios and deliver parcels to your doorstep.',
        '2. No Third-Party Resale: We never sell or rent buyer or seller personal information to third-party ad networks.',
        '3. Creator Communication: Your shipping name and phone are shared only with the specific studio from which you purchased to facilitate delivery.'
      ]
    },
    refund: {
      title: 'Refund & Return Guidelines (Draft / Placeholder)',
      subtitle: 'Honest dispute resolution between buyers and independent creators',
      content: [
        '1. Handcrafted Variations: Because many items on Selloi are handmade or small-batch, minor natural imperfections and color nuances are normal parts of craftsmanship.',
        '2. Transit Damage: If an item arrives broken or damaged during transit, notify the creator and Selloi within 48 hours with unboxing photos for a swift replacement or refund.',
        '3. Custom Pieces: Bespoke personalized creations (engraved, custom stitched) are generally non-returnable unless defective.'
      ]
    },
    seller: {
      title: 'Seller Handbook & Verification Guidelines',
      subtitle: 'Standards for maintaining a verified storefront on Selloi',
      content: [
        '1. Verification Review: The Verified badge is strictly awarded after Selloi manually checks your social media portfolio, product photos, and creator identity.',
        '2. Transparent Pricing: Display final prices clearly without requiring hidden DMs for standard listings.',
        '3. Honest Dispatch: Keep stock accurate and ship confirmed orders within the promised dispatch window.'
      ]
    },
    community: {
      title: 'Community Guidelines',
      subtitle: 'Fostering a respectful, supportive indie economy',
      content: [
        '1. Respect Creators: Remember that independent creators design and handcraft their items with passion.',
        '2. Constructive Feedback: Reviews must be genuine, honest reflections of product quality and delivery experience.',
        '3. Support Local: Prioritize and uplift young regional artisans, home businesses, and student entrepreneurs.'
      ]
    }
  };

  const current = policyData[type || 'terms'] || policyData['terms'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-600 font-semibold">
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Legal Notice:</strong> This document is a developmental draft / MVP placeholder and should undergo formal legal review prior to full commercial operations.
        </span>
      </div>

      <div className="bg-white rounded-4xl p-8 sm:p-12 border border-sand-200/90 shadow-soft-sm space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            {current.title}
          </h1>
          <p className="text-sm text-stone-500 mt-1">{current.subtitle}</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-sand-100 text-stone-700 text-sm leading-relaxed">
          {current.content.map((paragraph, index) => (
            <p key={index} className="p-3 rounded-2xl bg-sand-50/60 border border-sand-200/50">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
