import { atom } from "nanostores";

export const isScanOpen = atom(false);
export const isWhoisOpen = atom(false);

export const openScan = () => isScanOpen.set(true);
export const closeScan = () => isScanOpen.set(false);

export const openWhois = () => isWhoisOpen.set(true);
export const closeWhois = () => isWhoisOpen.set(false);
