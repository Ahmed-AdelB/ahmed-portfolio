import { atom } from "nanostores";

export type ChatbotOpenValue = boolean;

export const isChatbotOpen = atom<ChatbotOpenValue>(false);

export const openChatbot = (): void => isChatbotOpen.set(true);
export const closeChatbot = (): void => isChatbotOpen.set(false);
export const toggleChatbot = (): void =>
  isChatbotOpen.set(!isChatbotOpen.get());
