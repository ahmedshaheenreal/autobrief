import Joi from "joi";
import {
  DELIVERY_FREQUENCIES,
  DELIVERY_METHODS,
  DeliveryFrequency,
  DeliveryMethod,
  NEWS_TOPICS_ARRAY,
  NewsTopic,
} from "../constants/topics";
import { isValidTimezone } from "../utils/timezone";

export type NewUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone: string;
};

export type PreferencesInput = {
  topics: NewsTopic[];
  delivery_time: string;
  delivery_frequency: DeliveryFrequency;
  delivery_method: DeliveryMethod;
};

export const newUserSchema = Joi.object<NewUser>({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .pattern(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain at least one letter and one number.",
      "any.required": "Password is required.",
    }),
  firstName: Joi.string().trim().min(2).required().messages({
    "string.empty": "First name is required.",
    "any.required": "First name is required.",
  }),
  lastName: Joi.string().trim().min(2).required().messages({
    "string.empty": "Last name is required.",
    "any.required": "Last name is required.",
  }),
  timezone: Joi.string()
    .required()
    .custom((value, helpers) =>
      isValidTimezone(value) ? value : helpers.error("timezone.invalid")
    )
    .messages({
      "string.empty": "Timezone is required.",
      "any.required": "Timezone is required.",
      "timezone.invalid": "Please Provide a valid timezone.",
    }),
});

export const preferencesSchema = Joi.object<PreferencesInput>({
  topics: Joi.array()
    .items(Joi.string().valid(...NEWS_TOPICS_ARRAY))
    .min(1)
    .unique()
    .required()
    .messages({
      "any.only": "Invalid topic name.",
      "array.min": "At least one topic is required.",
      "array.unique": "Topics must not contain duplicates.",
      "any.required": "Topics are required.",
    }),
  delivery_time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      "string.pattern.base": "delivery_time must be in HH:mm format.",
      "any.required": "delivery_time is required.",
    }),
  delivery_frequency: Joi.string()
    .valid(...DELIVERY_FREQUENCIES)
    .required()
    .messages({
      "any.only": "delivery_frequency must be one of: daily, weekly.",
      "any.required": "delivery_frequency is required.",
    }),
  delivery_method: Joi.string()
    .valid(...DELIVERY_METHODS)
    .required()
    .messages({
      "any.only": "delivery_method must be one of: email, webhook.",
      "any.required": "delivery_method is required.",
    }),
});
