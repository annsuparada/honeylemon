// /app/components/FAQSection.tsx

'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

interface FAQ {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    faqs: FAQ[];
    title?: string;
    subtitle?: string;
    className?: string;
    variant?: 'default' | 'compact';
}

export default function FAQSection({
    faqs,
    title = "Frequently Asked Questions",
    subtitle,
    className = "",
    variant = 'default'
}: FAQSectionProps) {
    if (!faqs || faqs.length === 0) return null;

    const containerPadding = variant === 'compact'
        ? 'px-6 py-12 sm:py-16 lg:px-8'
        : 'px-6 py-24 sm:py-32 lg:px-8 lg:py-40';

    return (
        <div className={`bg-white ${className}`}>
            <div className={`mx-auto max-w-7xl ${containerPadding}`}>
                <div className="mx-auto max-w-4xl">
                    {/* Title */}
                    <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                        {title}
                    </h2>

                    {/* Optional subtitle */}
                    {subtitle && (
                        <p className="mt-4 text-lg text-gray-600">
                            {subtitle}
                        </p>
                    )}

                    {/* FAQ List */}
                    <dl className="mt-16 divide-y divide-gray-900/10">
                        {faqs.map((faq, index) => (
                            <Disclosure key={index} as="div" className="py-6 first:pt-0 last:pb-0">
                                <dt>
                                    <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900 hover:text-gray-700 transition-colors">
                                        <span className="text-base/7 font-semibold">{faq.question}</span>
                                        <span className="ml-6 flex h-7 items-center flex-shrink-0">
                                            <PlusSmallIcon aria-hidden="true" className="size-6 group-data-open:hidden" />
                                            <MinusSmallIcon aria-hidden="true" className="size-6 group-not-data-open:hidden" />
                                        </span>
                                    </DisclosureButton>
                                </dt>
                                <DisclosurePanel as="dd" className="mt-2 pr-12">
                                    <p className="text-base/7 text-gray-600">{faq.answer}</p>
                                </DisclosurePanel>
                            </Disclosure>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    )
}