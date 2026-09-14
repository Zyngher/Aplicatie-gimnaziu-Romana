import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Screen =
  | { name: 'home' }
  | { name: 'ortogrameHome' }
  | { name: 'setDetail'; setId: string }
  | { name: 'exercise'; setId: string; exerciseIndex: number };

interface NavigationContextValue {
  current: Screen;
  push: (screen: Screen) => void;
  pop: () => void;
  replace: (screen: Screen) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
  initialStack,
}: {
  children: ReactNode;
  initialStack?: Screen[];
}) {
  const [stack, setStack] = useState<Screen[]>(initialStack ?? [{ name: 'home' }]);

  const value = useMemo<NavigationContextValue>(
    () => ({
      current: stack[stack.length - 1],
      push: (screen) => setStack((s) => [...s, screen]),
      pop: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      replace: (screen) => setStack((s) => [...s.slice(0, -1), screen]),
    }),
    [stack],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation trebuie folosit în interiorul NavigationProvider');
  return ctx;
}
