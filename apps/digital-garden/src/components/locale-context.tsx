import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
} from "react";
import type { Language } from "../globals/i18n.ts";

const LocaleContext = createContext<Language | (string & {}) | null>(null);

interface LocaleProviderProps {
  locale?: Language | (string & {}) | null;
}

export const LocaleProvider: FC<PropsWithChildren<LocaleProviderProps>> = ({
  locale,
  children,
}) => {
  return (
    <LocaleContext.Provider value={locale ?? null}>
      {children}
    </LocaleContext.Provider>
  );
};

export function useLocale(): Language | (string & {}) | null {
  return useContext(LocaleContext);
}
