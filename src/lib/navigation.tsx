import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Screen =
  | { name: 'home' }
  | { name: 'ortogrameHome' }
  | { name: 'setDetail'; setId: string }
  | { name: 'exercise'; setId: string; exerciseIndex: number }
  | { name: 'setComplete'; setId: string };

interface NavigationContextValue {
  current: Screen;
  push: (screen: Screen) => void;
  pop: () => void;
  replace: (screen: Screen) => void;
  goHome: () => void;
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
      goHome: () => setStack([{ name: 'home' }]),
    }),
    [stack],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

// Conventie fixata a proiectului: fisierul exporta atat NavigationProvider (componenta) cat si
// useNavigation (hook) din acelasi fisier, tiparul "ecran cu useNavigation" (vezi .agent regula 8).
// Nu se separa in 2 fisiere, deci warning-ul oxlint react/only-export-components e adesea declansat.
export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation trebuie folosit în interiorul NavigationProvider');
  return ctx;
}
