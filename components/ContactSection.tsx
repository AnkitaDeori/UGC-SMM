'use client';
import { FormEvent, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Errs = Partial<Record<'name' | 'email' | 'project_description', string>>;
const fc = 'rounded-xl bg-soft px-3 py-2 font-sans text-sm text-tx outline-none focus-visible:ring-2 focus-visible:ring-ac';

export default function ContactSection() {
  const [errs, setErrs] = useState<Errs>({});
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setStatus(`Could not check email verification: ${error.message}`);
      setUser(data.session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const emailIsVerified = !!user?.email_confirmed_at
    && user.email?.trim().toLowerCase() === email.trim().toLowerCase();

  async function sendVerificationLink() {
    const normalizedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setErrs((current) => ({ ...current, email: 'Enter a valid email address first.' }));
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus('Email verification is unavailable right now. Please try again later.');
      return;
    }
    setVerifying(true);
    setStatus('Sending a verification link…');
    setErrs((current) => ({ ...current, email: undefined }));
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}${window.location.pathname}#contact`,
          shouldCreateUser: true,
        },
      });
      if (error) {
        setStatus(`Could not send a verification link: ${error.message}`);
      } else {
        setStatus(`Check ${normalizedEmail} and open the verification link in this browser. Then return here to submit your enquiry.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected network error occurred.';
      setStatus(`Could not send a verification link: ${message}`);
    } finally {
      setVerifying(false);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    const x: Errs = {};
    if (!v('name')) x.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(v('email'))) x.email = 'Enter a valid email address.';
    if (v('project_description').length < 10) x.project_description = 'Describe your project in at least 10 characters.';
    setErrs(x);
    if (Object.keys(x).length) { setStatus('Fix the highlighted fields.'); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus('The enquiry form is unavailable right now. Please email deoriankita2004@gmail.com directly.');
      return;
    }

    setBusy(true);
    setStatus('Checking verified email…');
    try {
      const { data: { user: authenticatedUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authenticatedUser?.email_confirmed_at) {
        setStatus('Verify your email first: enter it above, send a verification link, and open the link in this browser.');
        return;
      }
      if (authenticatedUser.email?.trim().toLowerCase() !== v('email').toLowerCase()) {
        setStatus('The verified email must match the email entered on the form. Verify this email address to continue.');
        return;
      }

      setStatus('Sending your enquiry…');
      const { error } = await supabase.from('portfolio_enquiries').insert({
        name: v('name'),
        email: authenticatedUser.email,
        project_type: v('type'),
        budget: v('budget'),
        project_description: v('project_description'),
      });
      if (error) {
        setStatus(`Could not save your enquiry: ${error.message}. Please email deoriankita2004@gmail.com directly.`);
        return;
      }
      form.reset();
      setEmail('');
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
          <input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={!!errs.email} aria-describedby="e-email" className={fc} />
          <span id="e-email" className="min-h-4 text-ac">{errs.email}</span>
          <button type="button" className="ulink justify-self-start font-mono text-xs text-ac disabled:opacity-50" disabled={verifying || emailIsVerified} onClick={() => void sendVerificationLink()}>
            {emailIsVerified ? 'Email verified' : verifying ? 'Sending link…' : 'Verify email'}
          </button>
        </label>
        <label className="grid gap-1 font-mono text-xs">Project type
          <select name="type" className={fc}><option>UGC</option><option>Social media management</option><option>Content creation</option><option>Other</option></select>
        </label>
        <label className="grid gap-1 font-mono text-xs">Budget (optional)
          <select name="budget" className={fc}><option>Not sure yet</option><option>Starter</option><option>Mid</option><option>Large</option></select>
        </label>
        <label className="grid gap-1 font-mono text-xs">Project description
          <textarea name="project_description" rows={3} aria-invalid={!!errs.project_description} aria-describedby="e-project-description" className={fc} />
          <span id="e-project-description" className="min-h-4 text-ac">{errs.project_description}</span>
        </label>
        <button type="submit" disabled={busy || !emailIsVerified} className="cta justify-self-start disabled:opacity-50">{busy ? 'Sending…' : 'Send inquiry'}</button>
        <p role="status" className="font-mono text-xs text-mu">{status}</p>
      </form>
    </section>
  );
}
