"use client";

type TimeOfDay = "day" | "sunset" | "night";

const TIME_ICONS: Record<TimeOfDay, string> = { day: "\u2600\uFE0F", sunset: "\u{1F305}", night: "\u{1F319}" };
const TIME_CYCLE: TimeOfDay[] = ["day", "sunset", "night"];

type TimeToggleProps = {
  timeOfDay: TimeOfDay;
  onChange: (t: TimeOfDay) => void;
};

function TimeToggle({ timeOfDay, onChange }: TimeToggleProps) {
  return (
    <button
      onClick={() => onChange(TIME_CYCLE[(TIME_CYCLE.indexOf(timeOfDay) + 1) % 3])}
      className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/45 backdrop-blur-xl border border-white/30 shadow-lg flex items-center justify-center text-xl hover:bg-white/55 active:scale-90 transition-all"
      title={`Switch to ${TIME_CYCLE[(TIME_CYCLE.indexOf(timeOfDay) + 1) % 3]}`}
    >
      {TIME_ICONS[timeOfDay]}
    </button>
  );
}

export { TimeToggle };
export type { TimeOfDay };
