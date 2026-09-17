import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../lib/navigation';
import { HomeButton } from './HomeButton';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

const deepStack: Screen[] = [
  { name: 'home' },
  { name: 'ortogrameHome' },
  { name: 'setDetail', setId: 'set-06-sa-sau-ia-iau' },
  { name: 'exercise', setId: 'set-06-sa-sau-ia-iau', exerciseIndex: 2 },
];

describe('HomeButton', () => {
  it('afiseaza un buton cu textul "Acasă"', () => {
    render(
      <NavigationProvider initialStack={deepStack}>
        <HomeButton />
      </NavigationProvider>,
    );
    expect(screen.getByRole('button', { name: 'Acasă' })).toBeInTheDocument();
  });

  it('la click, sare direct la ecranul home, indiferent de adancimea stivei', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={deepStack}>
        <HomeButton />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Acasă' }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"home"');
  });
});
