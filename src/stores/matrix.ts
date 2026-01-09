import { atom } from "nanostores";

export const isMatrixEnabled = atom(false);
export const matrixIntensity = atom(1);

export const toggleMatrix = () => isMatrixEnabled.set(!isMatrixEnabled.get());
export const enableMatrix = () => isMatrixEnabled.set(true);
export const disableMatrix = () => isMatrixEnabled.set(false);

export const setMatrixIntensity = (intensity: number) =>
  matrixIntensity.set(intensity);
export const intensifyMatrix = () =>
  matrixIntensity.set(matrixIntensity.get() + 1);
export const resetMatrixIntensity = () => matrixIntensity.set(1);
