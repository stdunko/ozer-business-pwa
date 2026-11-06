import { appConfig } from "../config";
import { storage } from "./storage";

const ONBOARDING_COMPLETED_KEY = "onboardingCompleted";

export const shouldShowOnboarding = (): boolean => {
  const { onboardingMode } = appConfig;

  if (onboardingMode === "never") {
    return false;
  }

  if (onboardingMode === "always") {
    return true;
  }

  return storage.get(ONBOARDING_COMPLETED_KEY) !== "true";
};

export const setOnboardingCompleted = () => {
  storage.set(ONBOARDING_COMPLETED_KEY, "true");
};
