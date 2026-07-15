import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
} from "react";
import type { User } from "../schema/users";

const UserContext = createContext<User | null>(null);

interface UserProviderProps {
  user?: User | null;
}

export const UserProvider: FC<PropsWithChildren<UserProviderProps>> = ({
  user,
  children,
}) => {
  return (
    <UserContext.Provider value={user ?? null}>{children}</UserContext.Provider>
  );
};

export function useUser(): User | null {
  return useContext(UserContext);
}
