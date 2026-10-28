// Track progress is the only persistent browser state used by StartHere.
export const STORAGE_KEY = 'u1-starthere.track.v1';
export function readProgress(raw, phases) {
  const clean = {version:1, steps:{}};
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed?.version !== 1 || !parsed.steps || typeof parsed.steps !== 'object') return clean;
    for (const step of phases.flatMap(phase => phase.steps)) {
      const value = parsed.steps[step.id];
      if (value === 'done' || (value === 'skipped' && step.optional)) clean.steps[step.id] = value;
    }
  } catch { /* Corrupt or old progress never blocks the track. */ }
  return clean;
}
export function progressCounts(progress, steps) {
  const done = steps.filter(step => progress.steps[step.id] === 'done').length;
  const skipped = steps.filter(step => step.optional && progress.steps[step.id] === 'skipped').length;
  return {done,skipped,finished:done+skipped,total:steps.length};
}
