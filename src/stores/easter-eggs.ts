import { persistentMap } from "@nanostores/persistent";

export type EasterEggId =
  | "konami"
  | "matrix"
  | "logo_click"
  | "coffee_redirect"
  | "hack_the_planet"
  | "salaam"
  | "bismillah";

export interface EasterEggState {
  found: boolean;
  timestamp: number;
}

export const easterEggs = persistentMap<Partial<Record<EasterEggId, string>>>(
  "easter_eggs:",
  {}
);

export const unlockEgg = (id: EasterEggId) => {
  const current = easterEggs.get();
  if (!current[id]) {
    easterEggs.setKey(id, JSON.stringify({
      found: true,
      timestamp: Date.now()
    }));
    return true; // Newly unlocked
  }
  return false; // Already unlocked
};

export const getFoundEggs = () => {
  const current = easterEggs.get();
  return Object.keys(current) as EasterEggId[];
};

export const isEggFound = (id: EasterEggId) => {
  return !!easterEggs.get()[id];
};

export const EASTER_EGG_DETAILS: Record<EasterEggId, { title: string; description: string; hint: string }> = {
  konami: {
    title: "Retro Gamer",
    description: "Unlocked the retro game mode",
    hint: "The classic cheat code"
  },
  matrix: {
    title: "The One",
    description: "Intensified the matrix rain",
    hint: "There is no spoon... just type it"
  },
  logo_click: {
    title: "Click Master",
    description: "Found the secret message",
    hint: "The logo seems clickable..."
  },
  coffee_redirect: {
    title: "Caffeine Addict",
    description: "Tried to access /coffee",
    hint: "Looking for a brew?"
  },
  hack_the_planet: {
    title: "Elite Hacker",
    description: "Hacked the planet",
    hint: "A famous movie quote"
  },
  salaam: {
    title: "Peaceful Greeting",
    description: "Shared a greeting of peace",
    hint: "Try saying 'salaam'"
  },
  bismillah: {
    title: "Blessed Start",
    description: "Began with the basmala",
    hint: "Begin in the name..."
  }
};
