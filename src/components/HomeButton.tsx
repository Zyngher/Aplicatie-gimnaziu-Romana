import { useNavigation } from '../lib/navigation';

export function HomeButton() {
  const navigation = useNavigation();
  return (
    <button type="button" onClick={() => navigation.goHome()}>
      Acasă
    </button>
  );
}
