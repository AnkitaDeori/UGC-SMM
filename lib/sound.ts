// Interface blips only. Off by default; the choice lasts for the session.
let on = false;
let ctx: AudioContext | null = null;

export function loadSound(): boolean {
  try { on = sessionStorage.getItem('snd') === '1'; } catch { /* ignore */ }
  return on;
}
export function setSound(v: boolean) {
  on = v;
  try { sessionStorage.setItem('snd', v ? '1' : '0'); } catch { /* ignore */ }
}
export function blip(freq = 440) {
  if (!on) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.13);
  } catch { /* ignore */ }
}
