import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../buttons/PrimaryButton';

// Mock the haptic feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  HapticFeedbackTypes: {
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    impactHeavy: 'impactHeavy',
  },
}));

describe('PrimaryButton', () => {
  it('should render button with text', () => {
    const { getByText } = render(
      <PrimaryButton text="Click Me" onPress={jest.fn()} />
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when clicked', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PrimaryButton text="Click Me" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalled Times(1);
  });

  it('should not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PrimaryButton text="Disabled" onPress={onPressMock} disabled={true} />
    );

    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    const { getByRole } = render(
      <PrimaryButton text="Submit" onPress={jest.fn()} loading={true} />
    );

    expect(getByRole('progressbar')).toBeTruthy();
  });

  it('should not call onPress when loading', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(
      <PrimaryButton text="Submit" onPress={onPressMock} loading={true} />
    );

    fireEvent.press(getByRole('progressbar'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('should apply different sizes', () => {
    const sizes = ['SM', 'MD', 'LG'] as const;

    sizes.forEach((size) => {
      const { getByText } = render(
        <PrimaryButton text={`Size ${size}`} onPress={jest.fn()} size={size} />
      );
      expect(getByText(`Size ${size}`)).toBeTruthy();
    });
  });

  it('should apply custom accessibility label', () => {
    const { getByLabelText } = render(
      <PrimaryButton
        text="Button"
        onPress={jest.fn()}
        accessibilityLabel="Custom Label"
      />
    );
    expect(getByLabelText('Custom Label')).toBeTruthy();
  });

  it('should use default accessibility label from text', () => {
    const { getByLabelText } = render(
      <PrimaryButton text="Default Label" onPress={jest.fn()} />
    );
    expect(getByLabelText('Default Label')).toBeTruthy();
  });
});
