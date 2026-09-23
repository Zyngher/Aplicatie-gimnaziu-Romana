import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationProvider, useNavigation } from '../../lib/navigation';
import { markExerciseCompleted, markOpenTextSelfCheck, buildProgressKey } from '../../lib/progress';
import { getManifest, getTopicById } from '../../lib/synant-content-loader';
import { SinonimeAntonimeHome } from './SinonimeAntonimeHome';
import styles from './SinonimeAntonimeHome.module.css';

function CurrentScreenProbe() {
  const navigation = useNavigation();
  return <p data-testid="current">{JSON.stringify(navigation.current)}</p>;
}

// Aceeași descoperire ca la OrtogrameHome.test.tsx: getByRole's `name` matcher cu
// `exact: false` nu face potrivire pe substring — un regex neancorat rezolvă.
function titleMatcher(title: string): RegExp {
  return new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe('SinonimeAntonimeHome — mod traseu (implicit)', () => {
  it('afiseaza toate temele din manifest', () => {
    render(<NavigationProvider><SinonimeAntonimeHome /></NavigationProvider>);
    expect(screen.getAllByRole('listitem')).toHaveLength(getManifest().topics.length);
  });

  it('primul set autorat este deblocat neconditionat', () => {
    const firstAuthored = getManifest().topics.find((t) => t.filePath !== null);
    if (!firstAuthored) throw new Error('Testul presupune cel putin o tema autorata in manifest');
    render(<NavigationProvider><SinonimeAntonimeHome /></NavigationProvider>);
    const button = screen.getByRole('button', { name: titleMatcher(firstAuthored.title) });
    expect(button).not.toBeDisabled();
  });

  it('click pe tema autorata si deblocata navigheaza la topicDetail', async () => {
    const user = userEvent.setup();
    const firstAuthored = getManifest().topics.find((t) => t.filePath !== null);
    if (!firstAuthored) throw new Error('Testul presupune cel putin o tema autorata in manifest');
    render(
      <NavigationProvider>
        <SinonimeAntonimeHome />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: titleMatcher(firstAuthored.title) }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"topicDetail"');
    expect(screen.getByTestId('current')).toHaveTextContent(firstAuthored.id);
  });

  it('foloseste clasele temei vizuale pe ecran si pe titlu', () => {
    const { container } = render(
      <NavigationProvider initialStack={[{ name: 'sinonimeAntonimeHome' }]}><SinonimeAntonimeHome /></NavigationProvider>,
    );
    expect(container.firstElementChild).toHaveClass(styles.screen);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(styles.title);
  });
});

describe('SinonimeAntonimeHome — buton inapoi catre Home', () => {
  it('afiseaza un buton care revine la pagina principala', async () => {
    const user = userEvent.setup();
    render(
      <NavigationProvider initialStack={[{ name: 'home' }, { name: 'sinonimeAntonimeHome' }]}>
        <SinonimeAntonimeHome />
        <CurrentScreenProbe />
      </NavigationProvider>,
    );
    await user.click(screen.getByRole('button', { name: /înapoi/i }));
    expect(screen.getByTestId('current')).toHaveTextContent('"name":"home"');
  });
});

function completeAuthoredTopic(topicId: string) {
  const topic = getTopicById(topicId);
  const progressKey = buildProgressKey('sinonime-antonime', topic.id);
  for (const exercise of topic.exercises) {
    if (exercise.responseMode === 'openText') {
      markOpenTextSelfCheck(progressKey, exercise.id, true);
    } else {
      markExerciseCompleted(progressKey, exercise.id);
    }
  }
}

describe('SinonimeAntonimeHome — index liber', () => {
  it('cu toate temele autorate terminate, comuta la index liber', () => {
    const authoredIds = getManifest().topics.filter((t) => t.filePath !== null).map((t) => t.id);
    authoredIds.forEach(completeAuthoredTopic);
    render(<NavigationProvider><SinonimeAntonimeHome /></NavigationProvider>);
    expect(screen.getByText(/index liber — recapitulare/i)).toBeInTheDocument();
  });
});
