export type ProfileFormData = {
  name: string;
  email: string;
  latitude: number;
  longitude: number;
  radius: number;
  categoriesCount: number;
};

export type ProfileFieldKey = "name" | "email" | "categories" | "location" | "radius";

export type ProfileValidationErrors = Partial<Record<ProfileFieldKey, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export const isValidEmail = (email: string) => EMAIL_REGEX.test(email.trim());

export const validateProfileForm = (data: ProfileFormData): ProfileValidationErrors => {
  const errors: ProfileValidationErrors = {};
  const name = data.name.trim();
  const email = data.email.trim();

  if (!name) {
    errors.name = "profileValidationNameRequired";
  } else if (name.length < 2) {
    errors.name = "profileValidationNameMin";
  }

  if (!email) {
    errors.email = "profileValidationEmailRequired";
  } else if (!isValidEmail(email)) {
    errors.email = "profileValidationEmailInvalid";
  }

  if (data.categoriesCount === 0) {
    errors.categories = "profileValidationCategoriesRequired";
  }

  if (!data.latitude || !data.longitude) {
    errors.location = "profileValidationLocationRequired";
  }

  if (!data.radius || data.radius <= 0) {
    errors.radius = "profileValidationRadiusRequired";
  }

  return errors;
};
