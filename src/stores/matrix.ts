import { atom } from "nanostores";

export const isMatrixEnabled = atom(false);

export const toggleMatrix = () => isMatrixEnabled.set(!isMatrixEnabled.get());
export const enableMatrix = () => isMatrixEnabled.set(true);
export const disableMatrix = () => isMatrixEnabled.set(false);
