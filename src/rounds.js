export const ROUNDS = {
  R1: { id: 'R1', level: 1, seconds: 300, modules: ['wires', 'button', 'password'] },
  R2: { id: 'R2', level: 2, seconds: 360, modules: ['wires', 'button', 'keypad', 'password'] },
  R3: { id: 'R3', level: 3, seconds: 420, modules: ['wires', 'button', 'keypad', 'password', 'dial'] },
};

// "R1", "r2-b", " R3-X7 " 허용. 변형 접미사는 같은 프리셋에 다른 시드.
export function parseRoundCode(code) {
  const m = String(code || '').trim().toUpperCase().match(/^R([123])(?:-([A-Z0-9]{1,4}))?$/);
  if (!m) return null;
  return { round: ROUNDS['R' + m[1]], variant: m[2] || '', code: 'R' + m[1] + (m[2] ? '-' + m[2] : '') };
}
