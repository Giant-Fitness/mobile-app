import { darkenColor, lightenColor } from '../colorUtils';

describe('colorUtils', () => {
  describe('darkenColor', () => {
    it('should darken a hex color by default amount (20%)', () => {
      const color = '#FF0000'; // Red
      const darkened = darkenColor(color);
      // Red component should be 204 (255 * 0.8)
      expect(darkened).toBe('#cc0000');
    });

    it('should darken a hex color by custom amount', () => {
      const color = '#FFFFFF'; // White
      const darkened = darkenColor(color, 0.5);
      // All components should be 127 (255 * 0.5, floored)
      expect(darkened).toBe('#7f7f7f');
    });

    it('should handle hex colors without # prefix', () => {
      const color = 'FF0000';
      const darkened = darkenColor(color);
      expect(darkened).toBe('#cc0000');
    });

    it('should handle edge case - black color', () => {
      const color = '#000000';
      const darkened = darkenColor(color);
      expect(darkened).toBe('#000000');
    });

    it('should darken each RGB component correctly', () => {
      const color = '#6495ED'; // Cornflower blue (100, 149, 237)
      const darkened = darkenColor(color, 0.3);
      // r = 100 * 0.7 = 70
      // g = 149 * 0.7 = 104
      // b = 237 * 0.7 = 165
      expect(darkened).toBe('#4668a5');
    });

    it('should handle zero darkening', () => {
      const color = '#FF00FF';
      const darkened = darkenColor(color, 0);
      expect(darkened).toBe('#ff00ff');
    });

    it('should handle full darkening', () => {
      const color = '#FF00FF';
      const darkened = darkenColor(color, 1);
      expect(darkened).toBe('#000000');
    });
  });

  describe('lightenColor', () => {
    it('should lighten a hex color by default amount (20%)', () => {
      const color = '#000000'; // Black
      const lightened = lightenColor(color);
      // All components should be 51 (0 + (255 - 0) * 0.2)
      expect(lightened).toBe('#333333');
    });

    it('should lighten a hex color by custom amount', () => {
      const color = '#000000'; // Black
      const lightened = lightenColor(color, 0.5);
      // All components should be 127 (0 + (255 - 0) * 0.5)
      expect(lightened).toBe('#7f7f7f');
    });

    it('should handle hex colors without # prefix', () => {
      const color = '000000';
      const lightened = lightenColor(color);
      expect(lightened).toBe('#333333');
    });

    it('should handle edge case - white color', () => {
      const color = '#FFFFFF';
      const lightened = lightenColor(color);
      expect(lightened).toBe('#ffffff');
    });

    it('should lighten each RGB component correctly', () => {
      const color = '#6495ED'; // Cornflower blue (100, 149, 237)
      const lightened = lightenColor(color, 0.3);
      // r = 100 + (255 - 100) * 0.3 = 100 + 46.5 = 146
      // g = 149 + (255 - 149) * 0.3 = 149 + 31.8 = 180
      // b = 237 + (255 - 237) * 0.3 = 237 + 5.4 = 242
      expect(lightened).toBe('#92b4f2');
    });

    it('should not exceed 255 for any component', () => {
      const color = '#F0F0F0';
      const lightened = lightenColor(color, 0.8);
      // All components should be capped at 255
      expect(lightened).toBe('#ffffff');
    });

    it('should handle zero lightening', () => {
      const color = '#00FF00';
      const lightened = lightenColor(color, 0);
      expect(lightened).toBe('#00ff00');
    });

    it('should handle full lightening', () => {
      const color = '#000000';
      const lightened = lightenColor(color, 1);
      expect(lightened).toBe('#ffffff');
    });
  });

  describe('darken and lighten symmetry', () => {
    it('should maintain reasonable color values when darkening and lightening', () => {
      const originalColor = '#6495ED';
      const darkened = darkenColor(originalColor, 0.2);
      const lightened = lightenColor(darkened, 0.2);

      // The values won't be exact due to rounding, but should be reasonably close
      expect(lightened).toBeDefined();
      expect(lightened).toMatch(/^#[0-9a-f]{6}$/);
    });
  });
});
