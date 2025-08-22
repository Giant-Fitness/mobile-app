// utils/colorUtils.ts

export const darkenColor = (color: string, amount: number = 0.2): string => {
    // Remove the '#' if present
    const hex = color.replace('#', '');

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Darken each component
    r = Math.floor(r * (1 - amount));
    g = Math.floor(g * (1 - amount));
    b = Math.floor(b * (1 - amount));

    // Convert back to hex
    const darkHex = '#' + (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (b < 16 ? '0' : '') + b.toString(16);

    return darkHex;
};

export const lightenColor = (color: string, amount: number = 0.2): string => {
    // Remove the '#' if present
    const hex = color.replace('#', '');

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Lighten each component
    r = Math.min(255, Math.floor(r + (255 - r) * amount));
    g = Math.min(255, Math.floor(g + (255 - g) * amount));
    b = Math.min(255, Math.floor(b + (255 - b) * amount));

    // Convert back to hex
    const lightHex = '#' + (r < 16 ? '0' : '') + r.toString(16) + (g < 16 ? '0' : '') + g.toString(16) + (b < 16 ? '0' : '') + b.toString(16);

    return lightHex;
};

export const addAlpha = (color: string, alpha: number = 0.9): string => {
    // Clamp alpha between 0 and 1
    alpha = Math.max(0, Math.min(1, alpha));

    // Remove the '#' if present
    const hex = color.replace('#', '');

    // Convert alpha to hex (0-255 range)
    const alphaHex = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();

    // Return hex color with alpha
    return `#${hex}${alphaHex}`;
};
