export interface AvatarPreset {
  id: string;
  label: string;
  emoji: string;
  bgGradient: string;
  textColor: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'grad', label: 'Scholar', emoji: '🎓', bgGradient: 'from-blue-500 to-indigo-600', textColor: 'text-white' },
  { id: 'owl', label: 'Wisdom', emoji: '🦉', bgGradient: 'from-amber-500 to-orange-600', textColor: 'text-white' },
  { id: 'fox', label: 'Clever', emoji: '🦊', bgGradient: 'from-orange-500 to-rose-600', textColor: 'text-white' },
  { id: 'rocket', label: 'Achiever', emoji: '🚀', bgGradient: 'from-indigo-500 to-purple-600', textColor: 'text-white' },
  { id: 'bolt', label: 'Dynamic', emoji: '⚡', bgGradient: 'from-yellow-400 to-amber-500', textColor: 'text-slate-900' },
  { id: 'star', label: 'Star', emoji: '🌟', bgGradient: 'from-yellow-500 to-amber-600', textColor: 'text-white' },
  { id: 'palette', label: 'Creative', emoji: '🎨', bgGradient: 'from-pink-500 to-rose-500', textColor: 'text-white' },
  { id: 'tech', label: 'Coder', emoji: '💻', bgGradient: 'from-emerald-500 to-teal-600', textColor: 'text-white' },
  { id: 'science', label: 'Scientist', emoji: '🔬', bgGradient: 'from-cyan-500 to-blue-600', textColor: 'text-white' },
  { id: 'leaf', label: 'Growth', emoji: '🌿', bgGradient: 'from-emerald-600 to-green-700', textColor: 'text-white' },
  { id: 'lion', label: 'Leader', emoji: '🦁', bgGradient: 'from-amber-600 to-red-600', textColor: 'text-white' },
  { id: 'dolphin', label: 'Innovator', emoji: '🐬', bgGradient: 'from-sky-400 to-indigo-500', textColor: 'text-white' },
];

export function getAvatarPreset(avatarId?: string): AvatarPreset {
  if (!avatarId) return AVATAR_PRESETS[0];
  const found = AVATAR_PRESETS.find(a => a.id === avatarId);
  return found || AVATAR_PRESETS[0];
}
