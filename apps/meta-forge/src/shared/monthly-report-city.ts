import z from "zod";

// order of cities determines render order in monthly report
export const monthlyReportCityNames = [
  "Tel-Aviv",
  "Jerusalem",
  "Haifa",
] as const;
export type MonthlyReportCityName = (typeof monthlyReportCityNames)[number];

export const monthlyReportCityNameSchema = z.enum(monthlyReportCityNames);

export interface MonthlyReportCity {
  aliases: Array<string>;
  latitude: number;
  longitude: number;
  name: MonthlyReportCityName;
  side: "left" | "right";
}

export const monthlyReportCities = [
  {
    aliases: ["haifa", "חיפה"],
    latitude: 32.81303,
    longitude: 34.99928,
    name: "Haifa",
    side: "left",
  },
  {
    aliases: ["jerusalem", "ירושלים"],
    latitude: 31.76904,
    longitude: 35.21633,
    name: "Jerusalem",
    side: "right",
  },
  {
    aliases: ["tel aviv", "tel-aviv", "תל אביב", "תל-אביב"],
    latitude: 32.08088,
    longitude: 34.78057,
    name: "Tel-Aviv",
    side: "left",
  },
] as const satisfies Array<MonthlyReportCity>;

export function findMonthlyReportCity(
  address: string,
): MonthlyReportCityName | null {
  const normalizedAddress = address.toLocaleLowerCase("en");
  const city = monthlyReportCities.find(({ aliases }) =>
    aliases.some((alias) => normalizedAddress.includes(alias)),
  );

  return city?.name ?? null;
}
