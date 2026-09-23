import { ErrorBoundary } from './components/ErrorBoundary';
import { NavigationProvider, useNavigation } from './lib/navigation';
import { Home } from './components/screens/Home';
import { OrtogrameHome } from './components/screens/OrtogrameHome';
import { SetDetail } from './components/screens/SetDetail';
import { ExerciseScreen } from './components/screens/ExerciseScreen';
import { SetComplete } from './components/screens/SetComplete';
import { SinonimeAntonimeHome } from './components/screens/SinonimeAntonimeHome';
import { TopicDetail } from './components/screens/TopicDetail';
import { SynAntExerciseScreen } from './components/screens/SynAntExerciseScreen';
import { TopicComplete } from './components/screens/TopicComplete';

function Router() {
  const navigation = useNavigation();
  switch (navigation.current.name) {
    case 'home':
      return <Home />;
    case 'ortogrameHome':
      return <OrtogrameHome />;
    case 'setDetail':
      return <SetDetail />;
    case 'exercise':
      return <ExerciseScreen />;
    case 'setComplete':
      return <SetComplete />;
    case 'sinonimeAntonimeHome':
      return <SinonimeAntonimeHome />;
    case 'topicDetail':
      return <TopicDetail />;
    case 'synantExercise':
      return <SynAntExerciseScreen />;
    case 'topicComplete':
      return <TopicComplete />;
    default: {
      const _exhaustive: never = navigation.current;
      return _exhaustive;
    }
  }
}

function App() {
  return (
    <ErrorBoundary>
      <NavigationProvider>
        <Router />
      </NavigationProvider>
    </ErrorBoundary>
  );
}

export default App;
