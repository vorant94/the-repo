import { useMediaQuery } from "@mantine/hooks";
import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useContext(breakpointsContext)[breakpoint];
}

export const BreakpointsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isSm, setIsSm] = useState(false);
  const isSmFromMediaQuery = useMediaQuery(breakpointToMediaQuery.sm);
  useEffect(() => {
    if (
      typeof isSmFromMediaQuery !== "undefined" &&
      isSm !== isSmFromMediaQuery
    ) {
      setIsSm(isSmFromMediaQuery);
    }
  }, [isSmFromMediaQuery, isSm]);

  const [isMd, setIsMd] = useState(false);
  const isMdFromMediaQuery = useMediaQuery(breakpointToMediaQuery.md);
  useEffect(() => {
    if (
      typeof isMdFromMediaQuery !== "undefined" &&
      isMd !== isMdFromMediaQuery
    ) {
      setIsMd(isMdFromMediaQuery);
    }
  }, [isMdFromMediaQuery, isMd]);

  const [isLg, setIsLg] = useState(false);
  const isLgFromMediaQuery = useMediaQuery(breakpointToMediaQuery.lg);
  useEffect(() => {
    if (
      typeof isLgFromMediaQuery !== "undefined" &&
      isLg !== isLgFromMediaQuery
    ) {
      setIsLg(isLgFromMediaQuery);
    }
  }, [isLgFromMediaQuery, isLg]);

  const [isXl, setIsXl] = useState(false);
  const isXlFromMediaQuery = useMediaQuery(breakpointToMediaQuery.xl);
  useEffect(() => {
    if (
      typeof isXlFromMediaQuery !== "undefined" &&
      isXl !== isXlFromMediaQuery
    ) {
      setIsXl(isXlFromMediaQuery);
    }
  }, [isXlFromMediaQuery, isXl]);

  const [is2xl, setIs2xl] = useState(false);
  const is2xlFromMediaQuery = useMediaQuery(breakpointToMediaQuery["2xl"]);
  useEffect(() => {
    if (
      typeof is2xlFromMediaQuery !== "undefined" &&
      is2xl !== is2xlFromMediaQuery
    ) {
      setIs2xl(is2xlFromMediaQuery);
    }
  }, [is2xlFromMediaQuery, is2xl]);

  return (
    <breakpointsContext.Provider
      value={{ sm: isSm, md: isMd, lg: isLg, xl: isXl, "2xl": is2xl }}
    >
      {children}
    </breakpointsContext.Provider>
  );
};

const breakpointsContext = createContext<Record<Breakpoint, boolean>>({
  sm: false,
  md: false,
  lg: false,
  xl: false,
  "2xl": false,
});

const breakpoints = ["sm", "md", "lg", "xl", "2xl"] as const;
type Breakpoint = (typeof breakpoints)[number];

const breakpointToMediaQuery = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const satisfies Record<Breakpoint, string>;
