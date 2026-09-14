import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation } from '../../lib/navigation';
import { Home } from './Home';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{navigation.current.name}</p>;
}

describe('Home (selector de unități)', () => {
  it('afiseaza toate cele 3 unitati', () => {
    render(<NavigationProvider><Home /></NavigationProvider>);
    expect(screen.getByText('Ortograme')).toBeInTheDocument();
    expect(screen.getByText('Sinonime și Antonime')).toBeInTheDocument();
    expect(screen.getByText('Literatură')).toBeInTheDocument();
  });

  it('Sinonime și Antonime si Literatura sunt dezactivate, cu eticheta "in curand"', () => {
    render(<NavigationProvider><Home /></NavigationProvider>);
    expect(screen.getByRole('button', { name: /sinonime și antonime/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /literatură/i })).toBeDisabled();
    expect(screen.getAllByText(/în curând/i)).toHaveLength(2);
  });

  it('click pe Ortograme navigheaza la ortogrameHome', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider>
        <Home />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /ortograme/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('ortogrameHome');
  });
});
