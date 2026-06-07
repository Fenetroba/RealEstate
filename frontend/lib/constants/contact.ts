import { SITE_BRAND_NAME } from '@/lib/site-brand';
import { footerSocialLinks } from '@/lib/constants/footer';

export const contactCopy = {
  metaTitle: `Contact — ${SITE_BRAND_NAME}`,
  title: 'Get in touch with us',
  lead:
    'Questions about the property registry, integrity audits, or listing a home? Send a message or reach us directly—we will respond as soon as we can.',
  formTitle: 'Contact form',
  infoTitle: 'Company contact information',
  socialTitle: 'Social media',
  submitLabel: 'Send message',
  submitSuccessTitle: 'Message received',
  submitSuccessMessage:
    'Thank you for reaching out. Our team will get back to you shortly.',
  fields: {
    fullName: 'Full name',
    email: 'Email',
    company: 'Company name (optional)',
    subject: 'Subject',
    message: 'Your message',
  },
} as const;

export type ContactInfoIcon = 'map' | 'mail' | 'phone' | 'clock';

export interface ContactInfoItem {
  icon: ContactInfoIcon;
  title: string;
  value: string;
  href?: string;
}

export const contactInfoItems: ContactInfoItem[] = [
  {
    icon: 'map',
    title: 'Address',
    value: 'Addis Ababa, Ethiopia',
  },
  {
    icon: 'mail',
    title: 'Email',
    value: 'hello@edenet.io',
    href: 'mailto:hello@edenet.io',
  },
  {
    icon: 'phone',
    title: 'Phone',
    value: '+1 (888) 555-0100',
    href: 'tel:+18885550100',
  },
  {
    icon: 'clock',
    title: 'Availability',
    value: 'Mon–Fri, 9:00 AM – 5:00 PM EAT',
  },
];

export const contactSocialLinks = footerSocialLinks;
