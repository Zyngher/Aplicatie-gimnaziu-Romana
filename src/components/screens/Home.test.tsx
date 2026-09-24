import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation } from '../../lib/navigation';
import { Home } from './Home';
import styles from './Home.module.css';

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

  it('doar Literatura e dezactivata, cu eticheta "in curand"', () => {
    render(<NavigationProvider><Home /></NavigationProvider>);
    expect(screen.getByRole('button', { name: /ortograme/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /sinonime și antonime/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /literatură/i })).toBeDisabled();
    expect(screen.getAllByText(/în curând/i)).toHaveLength(1);
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

  it('click pe Sinonime si Antonime navigheaza la sinonimeAntonimeHome', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider>
        <Home />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /sinonime și antonime/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('sinonimeAntonimeHome');
  });

  it('foloseste clasele temei vizuale pe ecran si pe titlu', () => {
    const { container } = render(<NavigationProvider><Home /></NavigationProvider>);
    expect(container.firstElementChild).toHaveClass(styles.screen);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(styles.title);
  });
});
