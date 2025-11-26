import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SessionTimeoutDialog from '@/components/SessionTimeoutModal';

const meta: Meta<typeof SessionTimeoutDialog> = {
  title: 'Mobix/Final/SessionTimeoutDialog',
  component: SessionTimeoutDialog,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onStayActive: { action: 'onStayActive' },
  },
};

export default meta;

type Story = StoryObj<typeof SessionTimeoutDialog>;

export const AutoDecreasingTimer: Story = {
  args: {
    open: true,
    secondsLeft: 30,
  },
  render: (storyArgs) => {
    const [secondsLeft, setSecondsLeft] = React.useState(
      storyArgs.secondsLeft ?? 30,
    );
    const [open, setOpen] = React.useState(storyArgs.open ?? true);

    React.useEffect(() => {
      if (!open) return;
      if (secondsLeft <= 0) return;

      const id = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : prev));
      }, 1000);

      return () => clearInterval(id);
    }, [open, secondsLeft]);

    const handleStayActive = () => {
      // Esto dispara la acción en el panel de Storybook
      storyArgs.onStayActive?.();
      setOpen(false);
    };

    return (
      <SessionTimeoutDialog
        {...storyArgs}
        open={open}
        secondsLeft={secondsLeft}
        onStayActive={handleStayActive}
      />
    );
  },
};