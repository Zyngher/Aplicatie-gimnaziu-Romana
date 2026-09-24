import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../../lib/navigation';
import { TopicComplete } from './TopicComplete';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

const initialStack: Screen[] = [
  { name: 'home' },
  { name: 'sinonimeAntonimeHome' },
  { name: 'topicDetail', topicId: 'topic-01-vremea-vesela' },
  { name: 'topicComplete', topicId: 'topic-01-vremea-vesela' },
];

describe('TopicComplete', () => {
  it('afiseaza un titlu de felicitare si procentul de completare', () => {
    render(<NavigationProvider initialStack={initialStack}><TopicComplete /></NavigationProvider>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/% completat/)).toBeInTheDocument();
  });

  it('afiseaza componenta de mascota si motivul stampila', () => {
    const { container } = render(<NavigationProvider initialStack={initialStack}><TopicComplete /></NavigationProvider>);
    expect(container.querySelector('video')).not.toBeNull();
    expect(screen.getByText(/bravo/i)).toBeInTheDocument();
  });

  it('butonul "Inapoi la traseu" revine la SinonimeAntonimeHome, sarind peste TopicDetail', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={initialStack}>
        <TopicComplete />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /înapoi la traseu/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"sinonimeAntonimeHome"');
  });
});
