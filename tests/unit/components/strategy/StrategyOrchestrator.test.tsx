import React, { Suspense } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { StrategyOrchestrator } from '@/components/strategy/StrategyOrchestrator';

type TestRegistryModule = 'testModule';
type TestAction = 'testAction';
type TestStrategies = 'one' | 'two';

const FakeOne = () => <div data-testid="strategy-one">One</div>;
const FakeTwo = () => <div data-testid="strategy-two">Two</div>;

vi.mock('@/config/moduleStrategies', async () => {
  const actual = await vi.importActual<typeof import('@/config/moduleStrategies')>(
    '@/config/moduleStrategies',
  );

  const moduleStrategyRegistry = {
    testModule: {
      actions: {
        testAction: {
          defaultStrategy: 'one',
          strategies: {
            one: { loader: async () => ({ default: FakeOne }) },
            two: { loader: async () => ({ default: FakeTwo }) },
          },
        },
      },
    },
  } as unknown as typeof actual.moduleStrategyRegistry; // Force cast for the mock to match type structure

  return {
    ...actual,
    moduleStrategyRegistry,
  };
});

describe('StrategyOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the requested strategy component when present', async () => {
    render(
      <Suspense fallback={<div data-testid="fallback" />}>
        {/* @ts-expect-error: Forcing types for testing purposes as we are using mocked literal strings */}
        <StrategyOrchestrator<TestRegistryModule, TestAction>
          module="testModule"
          action="testAction" 
          strategy={'two' as TestStrategies}
        />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('strategy-two')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
  });

  it('renders the default strategy when requesting the default key', async () => {
    render(
      <Suspense fallback={<div data-testid="fallback" />}>
        {/* @ts-expect-error: Forcing types for testing purposes */}
        <StrategyOrchestrator<TestRegistryModule, TestAction>
          module="testModule"
          action="testAction"
          strategy={'one' as TestStrategies}
        />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('strategy-one')).toBeInTheDocument();
    });
  });
});
