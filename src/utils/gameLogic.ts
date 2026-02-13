// Fórmulas matemáticas del juego

/**
 * Calcula el nivel basado en la XP acumulada.
 * Fórmula: L = 0.07 * sqrt(XP)
 */
export const calculateLevel = (xp: number): number => {
    return Math.floor(0.07 * Math.sqrt(xp));
};

/**
 * Calcula la XP necesaria para alcanzar el siguiente nivel.
 * Fórmula inversa: XP = ((L + 1) / 0.07)^2
 */
export const xpForNextLevel = (currentLevel: number): number => {
    return Math.ceil(Math.pow((currentLevel + 1) / 0.07, 2));
};

/**
 * Calcula el progreso (0-100%) hacia el siguiente nivel.
 */
export const calculateProgressToNextLevel = (xp: number, currentLevel: number): number => {
    const currentLevelXP = Math.pow(currentLevel / 0.07, 2);
    const nextLevelXP = xpForNextLevel(currentLevel);

    if (xp < currentLevelXP) return 0; // Should not happen ideally

    const xpInLevel = xp - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;

    return Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));
};
