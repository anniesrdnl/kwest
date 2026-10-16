// Values of profiles.onboarding_step (0–10 allowed, so later phases can add steps).
export const ONBOARDING_WELCOME = 0; // not started: meet your companion
export const ONBOARDING_SHELF = 1; // welcome seen: fill the empty shelf
export const ONBOARDING_DONE = 2;

export const ONBOARDING_STEP_COUNT = 2;

export function isOnboarded(step: number): boolean {
  return step >= ONBOARDING_DONE;
}
