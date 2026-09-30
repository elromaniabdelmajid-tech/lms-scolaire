import katex from 'katex'

/**
 * Convertit une chaîne LaTeX en HTML prêt à être affiché.
 * Gère \( ... \) pour le mode inline et \[ ... \] pour le mode display.
 */
export function renderLatexToString(input: string): string {
  if (!input) return ''

  // 1. Nettoyer les backslashes échappés (\\\\( devient \()
  let cleanedInput = input.replace(/\\\\/g, '\\')

  // 2. Traiter les formules display \[ ... \]
  cleanedInput = cleanedInput.replace(/\\\[(.*?)\\\]/g, (match, equation) => {
    try {
      return katex.renderToString(equation.trim(), {
        displayMode: true,
        throwOnError: false,
      })
    } catch (error) {
      console.error('Erreur KaTeX (display):', error)
      return match
    }
  })

  // 3. Traiter les formules inline \( ... \)
  cleanedInput = cleanedInput.replace(/\\\((.*?)\\\)/g, (match, equation) => {
    try {
      return katex.renderToString(equation.trim(), {
        displayMode: false,
        throwOnError: false,
      })
    } catch (error) {
      console.error('Erreur KaTeX (inline):', error)
      return match
    }
  })

  return cleanedInput
}