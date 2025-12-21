import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MobixLoader from '@/components/loaders/MobixLoader';

// Elimina clases generadas de Emotion/MUI para que el snapshot no dependa de hashes inestables.
const stripEmotionClasses = (fragment: DocumentFragment) => {
  const clone = fragment.cloneNode(true) as DocumentFragment;
  clone.querySelectorAll('[class]').forEach((el) => {
    const current = el.getAttribute('class');
    if (!current) return;

    const stableClasses = current
      .split(/\s+/)
      .filter((cls) => cls && !cls.startsWith('css-'));

    if (stableClasses.length) {
      el.setAttribute('class', stableClasses.join(' '));
    } else {
      el.removeAttribute('class');
    }
  });

  return clone;
};

describe('MobixLoader Component', () => {
  it('renders the loading text correctly', () => {
    render(<MobixLoader />);
    
    const loadingText = screen.getByText(/ACTIVANDO MOVILIDAD INTELIGENTE/i);
    
    expect(loadingText).toBeInTheDocument();
  });

  it('renders the complex svg structure for data network', () => {
    const { container } = render(<MobixLoader />);
    
    const svgElements = container.querySelectorAll('svg');
    const dataNetworkPath = container.querySelector('path.connection-line');
    
    expect(svgElements.length).toBeGreaterThanOrEqual(3);
    expect(dataNetworkPath).toBeInTheDocument();
  });

  it('matches the DOM snapshot to prevent visual regression', () => {
    const { asFragment } = render(<MobixLoader />);
    
    const sanitizedFragment = stripEmotionClasses(asFragment());

    expect(sanitizedFragment).toMatchSnapshot();
  });

  it('contains the core element with correct styling structure', () => {
    const { container } = render(<MobixLoader />);
    
    const loaderContainer = container.firstChild;
    expect(loaderContainer).not.toBeNull();
  });
});
