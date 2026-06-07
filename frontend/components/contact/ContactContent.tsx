'use client';

import { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { ContactSocialLinks } from '@/components/contact/ContactSocialLinks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  contactBodyTextClass,
  contactCardTitleClass,
  contactFormCtaClass,
  contactFormPanelClass,
  contactFormRowClass,
  contactFormStackClass,
  contactGridClass,
  contactHeaderLeadSpacing,
  contactHeaderTitleSpacing,
  contactIconBoxClass,
  contactIconClass,
  contactInfoCardClass,
  contactInfoGridClass,
  contactPageDescriptionClass,
  contactPageContentTopClass,
  contactPageShellClass,
  contactPageTitleClass,
  contactSectionTitleClass,
  contactTextareaClass,
} from '@/lib/constants/contact-form-styles';
import { contactCopy, contactInfoItems, type ContactInfoIcon } from '@/lib/constants/contact';
import { contactFormSchema, contactValuesFromFormData } from '@/lib/validation/contact-schema';
import { zodFieldErrors } from '@/lib/validation/zod-utils';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

const infoIconMap: Record<ContactInfoIcon, LucideIcon> = {
  map: MapPin,
  mail: Mail,
  phone: Phone,
  clock: Clock,
};

export function ContactContent() {
  const dispatch = useAppDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const copy = contactCopy;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = contactValuesFromFormData(new FormData(form));
    const result = contactFormSchema.safeParse(values);
    if (!result.success) {
      setFieldErrors(zodFieldErrors(result.error));
      dispatch(
        addToast({
          type: 'error',
          title: 'Check the form',
          message: result.error.issues[0]?.message ?? 'Please fix the highlighted fields.',
        }),
      );
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      dispatch(
        addToast({
          type: 'success',
          title: copy.submitSuccessTitle,
          message: copy.submitSuccessMessage,
        }),
      );
      form.reset();
    }, 400);
  };

  return (
    <div className={cn(contactPageShellClass, contactPageContentTopClass)}>
      <div className={contactHeaderTitleSpacing}>
        <h1 className={contactPageTitleClass}>{copy.title}</h1>
      </div>

      <div className={contactHeaderLeadSpacing}>
        <p className={contactPageDescriptionClass}>{copy.lead}</p>
      </div>

      <div className={contactGridClass}>
        <div className={contactFormPanelClass}>
          <h2 className={cn(contactSectionTitleClass, 'mb-6 xl:mb-8 2xl:mb-10')}>
            {copy.formTitle}
          </h2>
          <form className={contactFormStackClass} onSubmit={handleSubmit} noValidate>
            <div className={contactFormRowClass}>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder={`${copy.fields.fullName} *`}
                autoComplete="name"
                error={fieldErrors.fullName}
              />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={`${copy.fields.email} *`}
                autoComplete="email"
                error={fieldErrors.email}
              />
            </div>

            <Input
              id="companyName"
              name="companyName"
              type="text"
              placeholder={copy.fields.company}
              autoComplete="organization"
              error={fieldErrors.companyName}
            />

            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder={copy.fields.subject}
              error={fieldErrors.subject}
            />

            <div>
              <textarea
                id="message"
                name="message"
                rows={6}
                placeholder={copy.fields.message}
                className={contactTextareaClass}
                aria-invalid={Boolean(fieldErrors.message)}
              />
              {fieldErrors.message ? (
                <p className="mt-1.5 text-sm text-destructive">{fieldErrors.message}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={contactFormCtaClass}
              isLoading={submitting}
            >
              {copy.submitLabel}
            </Button>
          </form>
        </div>

        <div>
          <h2 className={cn(contactSectionTitleClass, 'mb-6 xl:mb-8 2xl:mb-10')}>
            {copy.infoTitle}
          </h2>

          <div className={contactInfoGridClass}>
            {contactInfoItems.map((item) => {
              const Icon = infoIconMap[item.icon];
              const content = (
                <div className="flex items-start gap-3 xl:gap-4 2xl:gap-5">
                  <div className={contactIconBoxClass}>
                    <Icon className={contactIconClass} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className={cn(contactCardTitleClass, 'mb-1 xl:mb-2 2xl:mb-3')}>
                      {item.title}
                    </h3>
                    <p className={contactBodyTextClass}>{item.value}</p>
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    className={cn(
                      contactInfoCardClass,
                      'block transition-colors hover:border-accent/40 hover:bg-card',
                    )}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div key={item.title} className={contactInfoCardClass}>
                  {content}
                </div>
              );
            })}
          </div>

          <div>
            <h3 className={cn(contactCardTitleClass, 'mb-4 xl:mb-6 2xl:mb-8')}>
              {copy.socialTitle}
            </h3>
            <ContactSocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
