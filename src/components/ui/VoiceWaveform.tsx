import { type FC } from "react";

interface VoiceWaveformProps {
  isActive: boolean;
  className?: string;
}

const BAR_HEIGHTS = [4, 8, 6, 10, 6, 8] as const;

export const VoiceWaveform: FC<VoiceWaveformProps> = ({
  isActive,
  className,
}) => {
  return (
    <div
      className={`flex items-end gap-1 ${className ?? ""}`}
      aria-hidden="true"
    >
      {BAR_HEIGHTS.map((height, index) => (
        <span
          key={`voice-bar-${index}`}
          className={`w-1 rounded-full bg-blue-500 ${
            isActive ? "animate-bounce" : "opacity-40"
          }`}
          style={{
            height: `${height}px`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
