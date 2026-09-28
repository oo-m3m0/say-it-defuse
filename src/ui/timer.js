// Date.now 기준으로 남은 시간을 계산한다. 백그라운드로 갔다 와도 밀리지 않는다.
export function createTimer(seconds, onTick, onExpire) {
  let end = 0, handle = 0, stopped = false;
  const remaining = () => Math.max(0, end - Date.now());
  const tick = () => {
    if (stopped) return;
    const ms = remaining();
    onTick(ms);
    if (ms <= 0) { stop(); onExpire(); }
  };
  const stop = () => { stopped = true; clearInterval(handle); };
  return {
    start() { end = Date.now() + seconds * 1000; handle = setInterval(tick, 200); tick(); },
    stop, remaining,
  };
}
export function fmt(ms) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
