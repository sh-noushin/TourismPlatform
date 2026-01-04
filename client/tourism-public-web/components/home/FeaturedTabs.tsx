'use client';

import { useState } from 'react';

type Tab = 'tours' | 'houses';

interface FeaturedTabsProps {
  toursContent: React.ReactNode;
  housesContent: React.ReactNode;
}

export function FeaturedTabs({ toursContent, housesContent }: FeaturedTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('tours');

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-wider text-muted">EXPLORE OUR OFFERS</p>
        <h2 className="font-serif text-4xl font-bold text-text md:text-5xl">
          New and Most
          <br />
          Popular {activeTab === 'tours' ? 'Tours' : 'Houses'}
        </h2>
        <div className="mx-auto mt-4 h-1 w-24 bg-primary/20" />
      </div>

      {/* Tabs */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('tours')}
            className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${
              activeTab === 'tours'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-text'
            }`}
          >
            Tours
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${
              activeTab === 'houses'
                ? 'bg-primary text-white shadow-md'
                : 'text-muted hover:text-text'
            }`}
          >
            Houses
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'tours' ? toursContent : housesContent}
      </div>
    </section>
  );
}
