'use client';
import { useState } from 'react';
import type { CaseStudy } from '@/lib/data';
import Item from './Item';
import Modal from './Modal';
import PosterArt from './PosterArt';
import { grid } from './componentStyles';

export default function CaseStudies({ items }: { items: CaseStudy[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null ? null : items[selectedIndex];

  return (
    <>
      <div className={grid}>
        {items.map((item, index) => (
          <Item key={item.name} title={item.name} text={item.challenge} meta={`Concept project · ${item.cat}`}>
            <button type="button" onClick={() => setSelectedIndex(index)} className="cta text-base">Explore project</button>
          </Item>
        ))}
      </div>
      <Modal open={selected !== null} onClose={() => setSelectedIndex(null)} label="Concept project details">
        {selected && (
          <div className="space-y-3">
            <p className="font-mono text-xs text-ac">Concept project · spec work for a fictional brand</p>
            <h2 className="font-display text-4xl text-ac">{selected.name}</h2>
            <p><b>Creative challenge.</b> {selected.challenge}</p>
            <p><b>Content direction.</b> {selected.direction}</p>
            <p><b>Deliverables.</b> {selected.deliverables}</p>
            <PosterArt poster={{ kind: '', brand: selected.name, line: 'Mockup placeholder: add real visuals', bg: 'rgb(var(--ac))', fg: 'rgb(var(--bg))' }} minHeight="10rem" />
            <p className="font-mono text-xs text-mu">No client, no results claimed.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
