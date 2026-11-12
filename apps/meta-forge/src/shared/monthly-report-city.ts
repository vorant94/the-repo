import z from "zod";

// order of cities determines render order in monthly report
export const monthlyReportCityNames = [
  "Tel-Aviv",
  "Rishon LeZion",
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
    aliases: [
      "rishon lezion",
      "rishon le-zion",
      "rishon-lezion",
      "rishon le zion",
      "ראשון לציון",
      "ראשון-לציון",
    ],
    latitude: 31.96416667,
    longitude: 34.80444444,
    name: "Rishon LeZion",
    side: "left",
  },
  {
    aliases: [
      "tel aviv",
      "tel-aviv",
      "tel aviv-yafo",
      "תל אביב",
      "תל-אביב",
      "תל אביב-יפו",
    ],
    latitude: 32.08088,
    longitude: 34.78057,
    name: "Tel-Aviv",
    side: "left",
  },
] as const satisfies Array<MonthlyReportCity>;

export function findMonthlyReportCity(
  cityName?: string | null,
): MonthlyReportCityName | null {
  if (!cityName) {
    return null;
  }

  const normalizedCity = cityName.trim().toLocaleLowerCase("en");
  const city = monthlyReportCities.find(({ aliases }) =>
    aliases.some((alias) => alias === normalizedCity),
  );

  return city?.name ?? null;
}
