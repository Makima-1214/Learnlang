/**
 * Request validation schemas using simple validation helpers
 * (not using Zod to keep dependencies minimal)
 */

// Generic validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateString = (value, minLength = 1, maxLength = 1000) => {
  return (
    typeof value === "string" &&
    value.length >= minLength &&
    value.length <= maxLength
  );
};

export const validateInt = (value, min = 0, max = 100) => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= min && num <= max;
};

// Validation schemas for different features
export const schemas = {
  // Auth
  registerSchema: (data) => {
    const errors = [];
    if (!data.email || !validateEmail(data.email)) errors.push("Invalid email");
    if (!data.password || !validatePassword(data.password))
      errors.push("Password must be at least 6 characters");
    if (!data.name || !validateString(data.name, 2, 100))
      errors.push("Name must be 2-100 characters");
    if (data.username && !validateString(data.username, 2, 50))
      errors.push("Username must be 2-50 characters");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  loginSchema: (data) => {
    const errors = [];
    if (!data.email || !validateEmail(data.email)) errors.push("Invalid email");
    if (!data.password) errors.push("Password is required");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  // History/Evaluation
  evaluateSchema: (data) => {
    const errors = [];
    if (!data.sourceSentence || !validateString(data.sourceSentence, 5, 500))
      errors.push("Source sentence invalid");
    if (!data.userTranslation || !validateString(data.userTranslation, 5, 500))
      errors.push("User translation invalid");
    if (
      !data.difficulty ||
      !["EASY", "MEDIUM", "HARD"].includes(data.difficulty)
    )
      errors.push("Invalid difficulty");
    if (!data.mode || !["EN_ID", "ID_EN"].includes(data.mode))
      errors.push("Invalid mode");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  // Quiz
  quizSchema: (data) => {
    const errors = [];
    if (!data.title || !validateString(data.title, 3, 200))
      errors.push("Title must be 3-200 characters");
    if (data.description && !validateString(data.description, 0, 1000))
      errors.push("Description too long");
    if (typeof data.published !== "boolean")
      errors.push("Published must be boolean");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  quizAnswerSchema: (data) => {
    const errors = [];
    if (!data.quizId || typeof data.quizId !== "string")
      errors.push("Invalid quizId");
    if (!Array.isArray(data.answers)) errors.push("Answers must be array");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  // Blog
  blogSchema: (data) => {
    const errors = [];
    if (!data.title || !validateString(data.title, 3, 200))
      errors.push("Title must be 3-200 characters");
    if (!data.slug || !validateString(data.slug, 3, 200))
      errors.push("Slug must be 3-200 characters");
    if (!data.content || !validateString(data.content, 10, 50000))
      errors.push("Content must be 10-50000 characters");
    if (!data.excerpt || !validateString(data.excerpt, 10, 500))
      errors.push("Excerpt must be 10-500 characters");
    if (typeof data.published !== "boolean")
      errors.push("Published must be boolean");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  // Comments
  commentSchema: (data) => {
    const errors = [];
    if (!data.content || !validateString(data.content, 1, 5000))
      errors.push("Comment must be 1-5000 characters");
    if (!data.blogId || typeof data.blogId !== "string")
      errors.push("Invalid blogId");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  // Reactions
  reactionSchema: (data) => {
    const validEmojis = ["👍", "❤️", "😂", "🎉", "🤔", "👏"];
    const errors = [];
    if (!data.emoji || !validEmojis.includes(data.emoji))
      errors.push("Invalid emoji");
    if (!data.blogId || typeof data.blogId !== "string")
      errors.push("Invalid blogId");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },

  // Discussion messages
  messageSchema: (data) => {
    const errors = [];
    if (!data.content || !validateString(data.content, 1, 5000))
      errors.push("Message must be 1-5000 characters");
    if (!data.roomId || typeof data.roomId !== "string")
      errors.push("Invalid roomId");
    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  },
};

/**
 * Middleware to validate request and return error response
 */
export function createValidationMiddleware(schemaValidator) {
  return async (req) => {
    try {
      const result = schemaValidator(req.body);
      if (!result.valid) {
        return {
          valid: false,
          error: result.errors.join("; "),
        };
      }
      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: "Validation error: invalid request format",
      };
    }
  };
}
