let lock = null;
export async function keepAwake() {
  if (!('wakeLock' in navigator)) return false;
  const req = async () => { try { lock = await navigator.wakeLock.request('screen'); } catch { lock = null; } };
  await req();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') req(); });
  return !!lock;
}
