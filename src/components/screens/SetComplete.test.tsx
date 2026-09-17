import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../../lib/navigation';
import { SetComplete } from './SetComplete';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

const initialStack: Screen[] = [
  { name: 'home' },
  { name: 'ortogrameHome' },
  { name: 'setDetail', setId: 'set-06-sa-sau-ia-iau' },
  { name: 'setComplete', setId: 'set-06-sa-sau-ia-iau' },
];

describe('SetComplete', () => {
  it('afiseaza un titlu de felicitare si procentul de completare', () => {
    render(<NavigationProvider initialStack={initialStack}><SetComplete /></NavigationProvider>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/% completat/)).toBeInTheDocument();
  });

  it('afiseaza componenta de mascota si motivul stampila', () => {
    const { container } = render(<NavigationProvider initialStack={initialStack}><SetComplete /></NavigationProvider>);
    expect(container.querySelector('video')).not.toBeNull();
    expect(screen.getByText(/bravo/i)).toBeInTheDocument();
  });

  it('butonul "Inapoi la traseu" revine la OrtogrameHome, sarind peste SetDetail', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={initialStack}>
        <SetComplete />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /înapoi la traseu/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"ortogrameHome"');
  });
});
