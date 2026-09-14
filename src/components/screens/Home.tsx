import { useNavigation } from '../../lib/navigation';

interface UnitInfo {
  id: string;
  title: string;
  subtitle: string;
  active: boolean;
}

const UNITS: UnitInfo[] = [
  { id: 'ortograme', title: 'Ortograme', subtitle: '20 de seturi de exersat', active: true },
  {
    id: 'sinonime-antonime',
    title: 'Sinonime și Antonime',
    subtitle: 'Cuvinte cu înțeles asemănător sau opus',
    active: false,
  },
  { id: 'literatura', title: 'Literatură', subtitle: 'Texte și înțelegerea lor', active: false },
];

export function Home() {
  const navigation = useNavigation();

  return (
    <div>
      <h1>EvaluareaRO</h1>
      <p>Exersează limba română alături de personajele-ghid, în ritmul tău.</p>
      <ul>
        {UNITS.map((unit) => (
          <li key={unit.id}>
            <button
              type="button"
              disabled={!unit.active}
              onClick={() => {
                if (unit.active) navigation.push({ name: 'ortogrameHome' });
              }}
            >
              <span>{unit.title}</span> — {unit.subtitle}
              {!unit.active && <span> (În curând)</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
