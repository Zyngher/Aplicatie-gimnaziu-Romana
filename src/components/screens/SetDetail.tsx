import { getSetById } from '../../lib/content-loader';
import { stageLabels } from '../../lib/labels';
import { useNavigation } from '../../lib/navigation';

export function SetDetail() {
  const navigation = useNavigation();
  const screen = navigation.current;
  if (screen.name !== 'setDetail') return null;
  const set = getSetById(screen.setId);

  // Get unique stage labels for display
  const uniqueStages = Array.from(new Set(set.exercises.map((e) => stageLabels[e.stage])));

  return (
    <div>
      <button type="button" onClick={() => navigation.pop()}>
        ← Înapoi
      </button>
      <h1>{set.title}</h1>
      {set.pairs.map((pair) => (
        <section key={pair.id}>
          <h2>
            {pair.formA} / {pair.formB}
          </h2>
          <p>{pair.explanation}</p>
          <ul>
            {pair.contrastExamples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </section>
      ))}
      <div>
        {uniqueStages.join(', ')}
      </div>
      <ol>
        {set.exercises.map((exercise, index) => (
          <li key={exercise.id}>
            <button
              type="button"
              onClick={() => navigation.push({ name: 'exercise', setId: set.id, exerciseIndex: index })}
            >
              {exercise.prompt}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
