/**
 * Slack 이모지 단축코드(`:gift:`)를 유니코드 이모지(🎁)로 변환.
 *
 * Slack 으로 수집한 공지/질문 텍스트에는 `:gift:` `:shell:` `:rotating_light:`
 * 같은 단축코드가 그대로 들어있다. 화면에는 텍스트로 노출돼 깨져 보이므로,
 * 노출 직전에 유니코드로 치환한다.
 *
 * - 키는 언더스코어를 제거·소문자화해 정규화한다. Slack 은 같은 이모지를
 *   `:rotating_light:` 또는 `:rotatinglight:` 로 섞어 내보내기 때문.
 * - 표준 유니코드로 매핑되지 않는 커스텀 이모지는 `:name:` 원문을 유지한다
 *   (텍스트로 남기되 최소한 깨진 콜론은 줄인다).
 */

const RAW_MAP: Record<string, string> = {
  // 자주 쓰는 것
  gift: "🎁",
  shell: "🐚",
  sponge: "🧽",
  star: "⭐",
  star2: "🌟",
  sparkles: "✨",
  warning: "⚠️",
  rotating_light: "🚨",
  fire: "🔥",
  mega: "📣",
  loudspeaker: "📢",
  pushpin: "📌",
  round_pushpin: "📍",
  pray: "🙏",
  raising_hand: "🙋",
  raised_hand: "✋",
  hand: "✋",
  wave: "👋",
  clap: "👏",
  thumbsup: "👍",
  "+1": "👍",
  thumbsdown: "👎",
  heart: "❤️",
  hearts: "💕",
  tada: "🎉",
  confetti_ball: "🎊",
  camera_with_flash: "📸",
  camera: "📷",
  face_with_rolling_eyes: "🙄",
  smile: "😄",
  smiley: "😃",
  grin: "😁",
  joy: "😂",
  sweat_smile: "😅",
  blush: "😊",
  wink: "😉",
  thinking_face: "🤔",
  eyes: "👀",
  point_right: "👉",
  point_down: "👇",
  point_up: "☝️",
  white_check_mark: "✅",
  heavy_check_mark: "✔️",
  ballot_box_with_check: "☑️",
  x: "❌",
  bulb: "💡",
  rocket: "🚀",
  zap: "⚡",
  bell: "🔔",
  calendar: "📅",
  spiral_calendar_pad: "🗓️",
  clock: "🕐",
  alarm_clock: "⏰",
  hourglass: "⌛",
  memo: "📝",
  pencil: "✏️",
  books: "📚",
  book: "📖",
  link: "🔗",
  mag: "🔍",
  bar_chart: "📊",
  chart_with_upwards_trend: "📈",
  dart: "🎯",
  trophy: "🏆",
  medal: "🏅",
  crown: "👑",
  muscle: "💪",
  running: "🏃",
  coffee: "☕",
  beer: "🍺",
  pizza: "🍕",
  cake: "🍰",
  meat_on_bone: "🍖",
  house: "🏠",
  office: "🏢",
  pineapple: "🍍",
  ocean: "🌊",
  sunny: "☀️",
  rainbow: "🌈",
  100: "💯",
  ok_hand: "👌",
  v: "✌️",
  facepunch: "👊",
  handshake: "🤝",
  speech_balloon: "💬",
  question: "❓",
  exclamation: "❗",
};

/** 정규화 키(언더스코어 제거·소문자) → 유니코드 */
const EMOJI_MAP: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const [name, char] of Object.entries(RAW_MAP)) {
    m.set(name.replace(/_/g, "").toLowerCase(), char);
  }
  return m;
})();

/** Slack 단축코드를 유니코드 이모지로 치환. 매핑 없으면 원문 유지. */
export function slackEmoji(input: string | null | undefined): string {
  if (!input) return input ?? "";
  return input.replace(/:([a-z0-9_+-]+):/gi, (whole, name: string) => {
    const key = String(name).replace(/_/g, "").toLowerCase();
    return EMOJI_MAP.get(key) ?? whole;
  });
}
