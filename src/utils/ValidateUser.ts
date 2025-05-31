import { time } from "console";
import Joi from "joi";

export const newUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "any.required": "Email is required.",
  }),
  password: Joi.string()
    .pattern(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
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
  timezone: Joi.string().required().messages({
    "string.empty": "Timezone is required.",
  }),
});
