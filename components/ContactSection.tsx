'use client';
import { FormEvent, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Errs = Partial<Record<'name' | 'email' | 'details', string>>;
const fc = 'rounded-xl bg-soft px-3 py-2 font-sans text-sm text-tx outline-none focus-visible:ring-2 focus-visible:ring-ac';

export default function ContactSection() {
  const [errs, setErrs] = useState<Errs>({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    const x: Errs = {};
    if (!v('name')) x.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(v('email'))) x.email = 'Enter a valid email address.';
    if (v('details').length < 10) x.details = 'Describe your project in at least 10 characters.';
    setErrs(x);
    if (Object.keys(x).length) { setStatus('Fix the highlighted fields.'); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus('The enquiry form is unavailable right now. Please email deoriankita2004@gmail.com directly.');
      return;
    }

    setBusy(true);
    setStatus('Sending your enquiry…');
    try {
      const { error } = await supabase.from('portfolio_enquiries').insert({
        name: v('name'),
        email: v('email'),
        project_type: v('type'),
        budget: v('budget'),
        details: v('details'),
      });
      if (error) {
        setStatus(`Could not save your enquiry: ${error.message}. Please email deoriankita2004@gmail.com directly.`);
        return;
      }
      form.reset();
      setErrs({});
      setStatus('Your enquiry has been received. I’ll follow up using the email address you provided.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected network error occurred.';
      setStatus(`Could not save your enquiry: ${message}. Please email deoriankita2004@gmail.com directly.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="contact" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[1.1fr_.9fr]">
      <div>
        <h2 className="section-heading contact-heading gradient-text font-display">Have a project in mind? Let’s make it real.</h2>
        <p className="mt-4 max-w-[36ch] text-mu">Your enquiry is stored securely, and I’ll follow up using the email address you provide.</p>
      </div>
      <form onSubmit={submit} noValidate className="contact-form grid w-full max-w-sm gap-3">
        <label className="grid gap-1 font-mono text-xs">Name
          <input name="name" autoComplete="name" aria-invalid={!!errs.name} aria-describedby="e-name" className={fc} />
          <span id="e-name" className="min-h-4 text-ac">{errs.name}</span>
        </label>
        <label className="grid gap-1 font-mono text-xs">Email
          <input name="email" type="email" autoComplete="email" aria-invalid={!!errs.email} aria-describedby="e-email" className={fc} />
          <span id="e-email" className="min-h-4 text-ac">{errs.email}</span>
        </label>
        <label className="grid gap-1 font-mono text-xs">Project type
          <select name="type" className={fc}><option>UGC</option><option>Social media management</option><option>Content creation</option><option>Other</option></select>
        </label>
        <label className="grid gap-1 font-mono text-xs">Budget (optional)
          <select name="budget" className={fc}><option>Not sure yet</option><option>Starter</option><option>Mid</option><option>Large</option></select>
        </label>
        <label className="grid gap-1 font-mono text-xs">Project description
          <textarea name="details" rows={3} aria-invalid={!!errs.details} aria-describedby="e-details" className={fc} />
          <span id="e-details" className="min-h-4 text-ac">{errs.details}</span>
        </label>
        <button type="submit" disabled={busy} className="cta justify-self-start disabled:opacity-50">{busy ? 'Sending…' : 'Send inquiry'}</button>
        <p role="status" className="font-mono text-xs text-mu">{status}</p>
      </form>
    </section>
  );
}
