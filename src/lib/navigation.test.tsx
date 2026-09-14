import { describe, it, expect } from 'vitest';
import { render, screen as rtlScreen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from './navigation';

function Probe() {
  const navigation = useNavigation();
  return (
    <div>
      <p data-testid="current">{navigation.current.name}</p>
      <button onClick={() => navigation.push({ name: 'ortogrameHome' })}>du-te la ortogrameHome</button>
      <button onClick={() => navigation.pop()}>inapoi</button>
    </div>
  );
}

describe('NavigationProvider / useNavigation', () => {
  it('porneste implicit pe ecranul home', () => {
    render(<NavigationProvider><Probe /></NavigationProvider>);
    expect(rtlScreen.getByTestId('current')).toHaveTextContent('home');
  });

  it('push adauga un ecran nou pe stiva', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider><Probe /></NavigationProvider>);
    await user.click(rtlScreen.getByText('du-te la ortogrameHome'));
    expect(rtlScreen.getByTestId('current')).toHaveTextContent('ortogrameHome');
  });

  it('pop revine la ecranul anterior', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider><Probe /></NavigationProvider>);
    await user.click(rtlScreen.getByText('du-te la ortogrameHome'));
    await user.click(rtlScreen.getByText('inapoi'));
    expect(rtlScreen.getByTestId('current')).toHaveTextContent('home');
  });

  it('pop pe stiva cu un singur ecran nu face nimic (nu se poate iesi din home)', async () => {
    const user = userEvent.setup();
    render(<NavigationProvider><Probe /></NavigationProvider>);
    await user.click(rtlScreen.getByText('inapoi'));
    expect(rtlScreen.getByTestId('current')).toHaveTextContent('home');
  });

  it('accepta o stiva initiala custom, pentru testare directa a unui ecran adanc', () => {
    const initialStack: Screen[] = [{ name: 'home' }, { name: 'setDetail', setId: 'set-06-sa-sau-ia-iau' }];
    render(<NavigationProvider initialStack={initialStack}><Probe /></NavigationProvider>);
    expect(rtlScreen.getByTestId('current')).toHaveTextContent('setDetail');
  });
});
