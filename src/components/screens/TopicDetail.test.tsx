import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation, type Screen } from '../../lib/navigation';
import { TopicDetail } from './TopicDetail';
import styles from './TopicDetail.module.css';
import { markExerciseCompleted } from '../../lib/progress';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

const initialStack: Screen[] = [{ name: 'home' }, { name: 'topicDetail', topicId: 'topic-01-vremea-vesela' }];

describe('TopicDetail', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('afiseaza cuvintele-cheie cu explicatia lor', () => {
    render(<NavigationProvider initialStack={initialStack}><TopicDetail /></NavigationProvider>);
    expect(screen.getByText('vesel')).toBeInTheDocument();
    expect(screen.getByText(/plin de bucurie/i)).toBeInTheDocument();
  });

  it('etapele exercitiilor apar in romana, nu ca enum englezesc', () => {
    render(<NavigationProvider initialStack={initialStack}><TopicDetail /></NavigationProvider>);
    expect(screen.getAllByText(/ghidat/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^guided$/)).not.toBeInTheDocument();
  });

  it('click pe un exercitiu navigheaza la SynAntExerciseScreen cu indexul corect', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={initialStack}>
        <TopicDetail />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getAllByRole('button', { name: /ghidat/i })[0]);
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"synantExercise"');
    expect(screen.getByTestId('current')).toHaveTextContent('"exerciseIndex":0');
  });

  it('foloseste clasele temei vizuale pe ecran si titlu', () => {
    const { container } = render(<NavigationProvider initialStack={initialStack}><TopicDetail /></NavigationProvider>);
    expect(container.firstElementChild).toHaveClass(styles.screen);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(styles.title);
  });

  it('arata o bifa langa exercitiile deja completate', () => {
    markExerciseCompleted('sinonime-antonime:topic-01-vremea-vesela', 'ex-topic01-mcq-01');
    render(<NavigationProvider initialStack={initialStack}><TopicDetail /></NavigationProvider>);
    const completedButtons = screen.getAllByRole('button', { name: /✓/ });
    expect(completedButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('lista de exercitii apare inaintea cuvintelor-cheie in DOM', () => {
    render(<NavigationProvider initialStack={initialStack}><TopicDetail /></NavigationProvider>);
    const firstExerciseButton = screen.getAllByRole('button', { name: /ghidat/i })[0];
    const wordsHeading = screen.getByText('Ce trebuie să știi');
    // DOCUMENT_POSITION_FOLLOWING: wordsHeading vine DUPA firstExerciseButton in document.
    expect(
      firstExerciseButton.compareDocumentPosition(wordsHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
