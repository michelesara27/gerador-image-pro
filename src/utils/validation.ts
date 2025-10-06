// src/utils/validation.tsx
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface TemplateValidationData {
  name: string;
  prompt: string;
  category: string;
  exampleImage?: string;
}

export class TemplateValidator {
  private static readonly MIN_NAME_LENGTH = 3;
  private static readonly MAX_NAME_LENGTH = 50;
  private static readonly MIN_PROMPT_LENGTH = 10;
  private static readonly VALID_CATEGORIES = [
    "portrait",
    "artistic",
    "futuristic",
    "nature",
    "abstract",
    "vintage",
    "cartoon",
    "realistic",
    "fantasy",
    "other",
  ];

  static validateTemplate(data: TemplateValidationData): ValidationResult {
    const errors: string[] = [];

    // Validar nome
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    }

    // Validar prompt
    const promptValidation = this.validatePrompt(data.prompt);
    if (!promptValidation.isValid) {
      errors.push(...promptValidation.errors);
    }

    // Validar categoria
    const categoryValidation = this.validateCategory(data.category);
    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    }

    // Validar imagem de exemplo (se fornecida)
    if (data.exampleImage) {
      const imageValidation = this.validateExampleImage(data.exampleImage);
      if (!imageValidation.isValid) {
        errors.push(...imageValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("Nome é obrigatório");
    } else {
      const trimmedName = name.trim();

      if (trimmedName.length < this.MIN_NAME_LENGTH) {
        errors.push(
          `Nome deve ter pelo menos ${this.MIN_NAME_LENGTH} caracteres`
        );
      }

      if (trimmedName.length > this.MAX_NAME_LENGTH) {
        errors.push(
          `Nome deve ter no máximo ${this.MAX_NAME_LENGTH} caracteres`
        );
      }

      // Verificar caracteres especiais inválidos
      const invalidChars = /[<>:"\/\\|?*]/;
      if (invalidChars.test(trimmedName)) {
        errors.push("Nome contém caracteres inválidos");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validatePrompt(prompt: string): ValidationResult {
    const errors: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
      errors.push("Prompt é obrigatório");
    } else {
      const trimmedPrompt = prompt.trim();

      if (trimmedPrompt.length < this.MIN_PROMPT_LENGTH) {
        errors.push(
          `Prompt deve ter pelo menos ${this.MIN_PROMPT_LENGTH} caracteres`
        );
      }

      // Verificar se contém palavras proibidas (conteúdo inadequado)
      const forbiddenWords = ["nude", "naked", "nsfw", "explicit", "sexual"];
      const lowerPrompt = trimmedPrompt.toLowerCase();
      const foundForbiddenWords = forbiddenWords.filter((word) =>
        lowerPrompt.includes(word)
      );

      if (foundForbiddenWords.length > 0) {
        errors.push("Prompt contém conteúdo inadequado");
      }

      // Verificar se tem pelo menos algumas palavras descritivas
      const words = trimmedPrompt
        .split(/\s+/)
        .filter((word) => word.length > 2);
      if (words.length < 3) {
        errors.push("Prompt deve conter pelo menos 3 palavras descritivas");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateCategory(category: string): ValidationResult {
    const errors: string[] = [];

    if (!category || category.trim().length === 0) {
      errors.push("Categoria é obrigatória");
    } else if (!this.VALID_CATEGORIES.includes(category.toLowerCase())) {
      errors.push(
        `Categoria deve ser uma das seguintes: ${this.VALID_CATEGORIES.join(
          ", "
        )}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateExampleImage(exampleImage: string): ValidationResult {
    const errors: string[] = [];

    if (!exampleImage || exampleImage.trim().length === 0) {
      return { isValid: true, errors: [] }; // Imagem de exemplo é opcional
    }

    const trimmedImage = exampleImage.trim();

    // Verificar se é uma URL válida ou data URL
    const urlPattern = /^(https?:\/\/)|(data:image\/)/;
    if (!urlPattern.test(trimmedImage)) {
      errors.push("Imagem de exemplo deve ser uma URL válida ou data URL");
    }

    // Verificar tamanho máximo da string (para data URLs)
    if (trimmedImage.startsWith("data:") && trimmedImage.length > 6000000) {
      errors.push("Imagem de exemplo é muito grande (máximo 6MB)");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static getValidCategories(): string[] {
    return [...this.VALID_CATEGORIES];
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/\s+/g, " ");
  }

  static formatValidationErrors(errors: string[]): string {
    if (errors.length === 0) return "";
    if (errors.length === 1) return errors[0];

    return errors.map((error, index) => `${index + 1}. ${error}`).join("\n");
  }
}

// Validações específicas para formulários
export class FormValidator {
  static validateRequired(value: string, fieldName: string): string | null {
    if (!value || value.trim().length === 0) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  }

  static validateMinLength(
    value: string,
    minLength: number,
    fieldName: string
  ): string | null {
    if (value && value.trim().length < minLength) {
      return `${fieldName} deve ter pelo menos ${minLength} caracteres`;
    }
    return null;
  }

  static validateMaxLength(
    value: string,
    maxLength: number,
    fieldName: string
  ): string | null {
    if (value && value.trim().length > maxLength) {
      return `${fieldName} deve ter no máximo ${maxLength} caracteres`;
    }
    return null;
  }

  static validateEmail(email: string): string | null {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailPattern.test(email)) {
      return "Email deve ter um formato válido";
    }
    return null;
  }

  static validateUrl(url: string): string | null {
    try {
      new URL(url);
      return null;
    } catch {
      return "URL deve ter um formato válido";
    }
  }
}
