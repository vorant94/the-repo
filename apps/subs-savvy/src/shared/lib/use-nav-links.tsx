import {
  createContext,
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useContext,
} from "react";
import type { Translation } from "./translation.ts";

export function useNavLinks(): UseNavLinks {
  return useContext(navLinksContext);
}

export interface UseNavLinks {
  topNavLinks: Array<NavLink>;
  bottomNavLinks: Array<NavLink>;
}

export interface NavLink {
  label: keyof Translation;
  path: string;
  icon: ReactNode;
}

export const NavLinksProvider: FC<PropsWithChildren<NavLinksProviderProps>> = ({
  children,
  topNavLinks,
  bottomNavLinks,
}) => {
  return (
    <navLinksContext.Provider value={{ topNavLinks, bottomNavLinks }}>
      {children}
    </navLinksContext.Provider>
  );
};

export interface NavLinksProviderProps {
  topNavLinks: Array<NavLink>;
  bottomNavLinks: Array<NavLink>;
}

const navLinksContext = createContext<UseNavLinks>({
  topNavLinks: [],
  bottomNavLinks: [],
});
