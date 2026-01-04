import { persistentMap } from "@nanostores/persistent";
import { computed } from "nanostores";

export type CTFFlags = {
  flag1_robots: "false" | "true";
  flag2_terminal: "false" | "true";
  flag3_chatbot: "false" | "true";
};

export const ctfStore = persistentMap<CTFFlags>("ctf:", {
  flag1_robots: "false",
  flag2_terminal: "false",
  flag3_chatbot: "false",
});

export const foundFlagsCount = computed(ctfStore, (flags) => {
  return Object.values(flags).filter((found) => found === "true").length;
});

export const isMasterHacker = computed(ctfStore, (flags) => {
  return (
    flags.flag1_robots === "true" &&
    flags.flag2_terminal === "true" &&
    flags.flag3_chatbot === "true"
  );
});

export const foundFlag = (flagId: keyof CTFFlags) => {
  const current = ctfStore.get();
  if (current[flagId] !== "true") {
    ctfStore.setKey(flagId, "true");
    // Celebrate?
    return true;
  }
  return false;
};
