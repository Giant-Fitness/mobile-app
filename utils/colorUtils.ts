// utils/colorUtils.ts

export const darkenColor = (color: string, amount: number = 0.2): string => {
    const rgba = parseColor(color);
    if (!rgba) return color;

    const [r, g, b, a] = rgba;

    // Darken each component
    const newR = Math.floor(r * (1 - amount));
    const newG = Math.floor(g * (1 - amount));
    const newB = Math.floor(b * (1 - amount));

    return `rgba(${newR}, ${newG}, ${newB}, ${a})`;
};

export const lightenColor = (color: string, amount: number = 0.2): string => {
    const rgba = parseColor(color);
    if (!rgba) return color;

    const [r, g, b, a] = rgba;

    // Lighten each component
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

    return `rgba(${newR}, ${newG}, ${newB}, ${a})`;
};

export const addAlpha = (color: string, alpha: number = 0.9): string => {
    // Clamp alpha between 0 and 1
    alpha = Math.max(0, Math.min(1, alpha));

    const rgba = parseColor(color);
    if (!rgba) return color;

    const [r, g, b] = rgba;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper function to parse different color formats into RGBA values
const parseColor = (color: string): [number, number, number, number] | null => {
    color = color.trim();

    // Handle hex colors (#RGB, #RRGGBB, #RRGGBBAA)
    if (color.startsWith('#')) {
        const hex = color.slice(1);

        if (hex.length === 3) {
            // #RGB -> #RRGGBB
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return [r, g, b, 1];
        } else if (hex.length === 6) {
            // #RRGGBB
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return [r, g, b, 1];
        } else if (hex.length === 8) {
            // #RRGGBBAA
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const a = parseInt(hex.substring(6, 8), 16) / 255;
            return [r, g, b, a];
        }
    }

    // Handle rgb() and rgba() colors
    const rgbaMatch = color.match(/rgba?\(\s*([^)]+)\)/);
    if (rgbaMatch) {
        const values = rgbaMatch[1].split(',').map((v) => parseFloat(v.trim()));

        if (values.length >= 3) {
            const r = values[0];
            const g = values[1];
            const b = values[2];
            const a = values.length >= 4 ? values[3] : 1;

            return [r, g, b, a];
        }
    }

    return null;
};

// Utility function to convert any color format to hex (useful for backwards compatibility)
export const toHex = (color: string): string => {
    const rgba = parseColor(color);
    if (!rgba) return color;

    const [r, g, b, a] = rgba;

    const toHexComponent = (value: number) => {
        const hex = Math.round(value).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    if (a < 1) {
        // Include alpha in hex
        const alphaHex = toHexComponent(a * 255);
        return `#${toHexComponent(r)}${toHexComponent(g)}${toHexComponent(b)}${alphaHex}`;
    } else {
        return `#${toHexComponent(r)}${toHexComponent(g)}${toHexComponent(b)}`;
    }
};

// Utility function to convert any color format to rgba
export const toRgba = (color: string, alpha?: number): string => {
    const rgba = parseColor(color);
    if (!rgba) return color;

    const [r, g, b, a] = rgba;
    const finalAlpha = alpha !== undefined ? alpha : a;

    return `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
};
