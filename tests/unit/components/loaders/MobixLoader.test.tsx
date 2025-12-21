import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MobixLoader from '@/components/loaders/MobixLoader';

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
    
    expect(asFragment()).toMatchSnapshot();
  });

  it('contains the core element with correct styling structure', () => {
    const { container } = render(<MobixLoader />);
    
    const loaderContainer = container.firstChild;
    expect(loaderContainer).not.toBeNull();
  });
});