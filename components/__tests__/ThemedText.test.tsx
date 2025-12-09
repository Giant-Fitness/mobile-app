import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../base/ThemedText';

describe('ThemedText', () => {
  it('should render with default body type', () => {
    const { getByText } = render(<ThemedText>Test Text</ThemedText>);
    expect(getByText('Test Text')).toBeTruthy();
  });

  it('should render with different text types', () => {
    const types = [
      'body',
      'titleLarge',
      'title',
      'subtitle',
      'caption',
      'link',
      'button',
      'overline',
    ] as const;

    types.forEach((type) => {
      const { getByText } = render(<ThemedText type={type}>Test</ThemedText>);
      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('should apply custom styles', () => {
    const { getByText } = render(
      <ThemedText style={{ fontSize: 20 }}>Custom Style</ThemedText>
    );
    const element = getByText('Custom Style');
    expect(element.props.style).toContainEqual(expect.objectContaining({ fontSize: 20 }));
  });

  it('should disable font scaling', () => {
    const { getByText } = render(<ThemedText>No Scaling</ThemedText>);
    const element = getByText('No Scaling');
    expect(element.props.allowFontScaling).toBe(false);
  });

  it('should pass through additional props', () => {
    const { getByText } = render(
      <ThemedText numberOfLines={2} testID="themed-text">
        Test
      </ThemedText>
    );
    const element = getByText('Test');
    expect(element.props.numberOfLines).toBe(2);
    expect(element.props.testID).toBe('themed-text');
  });
});
