import {
  IconBarbell,
  IconBed,
  IconBolt,
  IconBucketDroplet,
  IconBuilding,
  IconBuildingBank,
  IconBuildings,
  IconCake,
  IconCar,
  IconCarCrash,
  IconCat,
  IconCreditCard,
  IconDental,
  IconDeviceMobile,
  IconEye,
  IconFlame,
  IconHeart,
  IconHome,
  IconMedicalCross,
  IconMoneybag,
  IconPhone,
  IconPlaneArrival,
  IconPlaneDeparture,
  IconReceipt,
  IconScissors,
  IconTheater,
  IconUsers,
  IconWiperWash,
  IconWorld,
  IconYinYang,
} from "@tabler/icons-react";
import type { ReactElement } from "react";
import GitHub from "simple-icons/icons/github.svg?react";
import GoDaddy from "simple-icons/icons/godaddy.svg?react";
import Google from "simple-icons/icons/google.svg?react";
import HeadSpace from "simple-icons/icons/headspace.svg?react";
import JetBrains from "simple-icons/icons/jetbrains.svg?react";
import Netflix from "simple-icons/icons/netflix.svg?react";
import ProtonMail from "simple-icons/icons/protonmail.svg?react";
import Spotify from "simple-icons/icons/spotify.svg?react";
import Telegram from "simple-icons/icons/telegram.svg?react";
import YouTube from "simple-icons/icons/youtube.svg?react";
import { cn } from "../ui/cn.ts";
import { Icon } from "../ui/icon.tsx";
import Moovit from "../ui/moovit.svg?react";
import type { SubscriptionIconModel } from "./subscription-icon.model.ts";

// must be in a separate file so the subscription-icon can be simple .ts file hence can be used in playwright
export const subscriptionIconToSvg = {
  telegram: <Telegram className={cn("fill-[#26A5E4]")} />,
  netflix: <Netflix className={cn("fill-[#E50914]")} />,
  jetbrains: <JetBrains className={cn("fill-[#000000]")} />,
  github: <GitHub className={cn("fill-[#181717]")} />,
  youtube: <YouTube className={cn("fill-[#FF0000]")} />,
  house: (
    <Icon
      size="2em"
      icon={IconHome}
      className={cn("text-slate-800")}
    />
  ),
  headspace: <HeadSpace className={cn("fill-[#F47D31]")} />,
  godaddy: <GoDaddy className={cn("fill-[#1BDBDB]")} />,
  moovit: <Moovit className={cn("fill-[#FF6400]")} />,
  tooth: (
    <Icon
      size="2em"
      icon={IconDental}
      className={cn("text-slate-800")}
    />
  ),
  car: (
    <Icon
      size="2em"
      icon={IconCar}
      className={cn("text-slate-800")}
    />
  ),
  eye: (
    <Icon
      size="2em"
      icon={IconEye}
      className={cn("text-slate-800")}
    />
  ),
  heart: (
    <Icon
      size="2em"
      icon={IconHeart}
      className={cn("text-slate-800")}
    />
  ),
  city: (
    <Icon
      size="2em"
      icon={IconBuildings}
      className={cn("text-slate-800")}
    />
  ),
  "plane-departure": (
    <Icon
      size="2em"
      icon={IconPlaneDeparture}
      className={cn("text-slate-800")}
    />
  ),
  "plane-arrival": (
    <Icon
      size="2em"
      icon={IconPlaneArrival}
      className={cn("text-slate-800")}
    />
  ),
  "car-burst": (
    <Icon
      size="2em"
      icon={IconCarCrash}
      className={cn("text-slate-800")}
    />
  ),
  dumbbell: (
    <Icon
      size="2em"
      icon={IconBarbell}
      className={cn("text-slate-800")}
    />
  ),
  bolt: (
    <Icon
      size="2em"
      icon={IconBolt}
      className={cn("text-slate-800")}
    />
  ),
  "people-group": (
    <Icon
      size="2em"
      icon={IconUsers}
      className={cn("text-slate-800")}
    />
  ),
  "sack-dollar": (
    <Icon
      size="2em"
      icon={IconMoneybag}
      className={cn("text-slate-800")}
    />
  ),
  "yin-yang": (
    <Icon
      size="2em"
      icon={IconYinYang}
      className={cn("text-slate-800")}
    />
  ),
  cat: (
    <Icon
      size="2em"
      icon={IconCat}
      className={cn("text-slate-800")}
    />
  ),
  "kit-medical": (
    <Icon
      size="2em"
      icon={IconMedicalCross}
      className={cn("text-slate-800")}
    />
  ),
  "proton-mail": <ProtonMail className={cn("fill-[#6D4AFF]")} />,
  google: <Google className={cn("fill-[#4285F4]")} />,
  spotify: <Spotify className={cn("fill-[#1DB954]")} />,
  landmark: (
    <Icon
      size="2em"
      icon={IconBuildingBank}
      className={cn("text-slate-800")}
    />
  ),
  "faucet-drip": (
    <Icon
      size="2em"
      icon={IconBucketDroplet}
      className={cn("text-slate-800")}
    />
  ),
  "fire-flame-simple": (
    <Icon
      size="2em"
      icon={IconFlame}
      className={cn("text-slate-800")}
    />
  ),
  scissors: (
    <Icon
      size="2em"
      icon={IconScissors}
      className={cn("text-slate-800")}
    />
  ),
  receipt: (
    <Icon
      size="2em"
      icon={IconReceipt}
      className={cn("text-slate-800")}
    />
  ),
  globe: (
    <Icon
      size="2em"
      icon={IconWorld}
      className={cn("text-slate-800")}
    />
  ),
  building: (
    <Icon
      size="2em"
      icon={IconBuilding}
      className={cn("text-slate-800")}
    />
  ),
  phone: (
    <Icon
      size="2em"
      icon={IconPhone}
      className={cn("text-slate-800")}
    />
  ),
  "credit-card": (
    <Icon
      size="2em"
      icon={IconCreditCard}
      className={cn("text-slate-800")}
    />
  ),
  "cake-candles": (
    <Icon
      size="2em"
      icon={IconCake}
      className={cn("text-slate-800")}
    />
  ),
  "wiper-wash": (
    <Icon
      size="2em"
      icon={IconWiperWash}
      className={cn("text-slate-800")}
    />
  ),
  bed: (
    <Icon
      size="2em"
      icon={IconBed}
      className={cn("text-slate-800")}
    />
  ),
  "device-mobile": (
    <Icon
      size="2em"
      icon={IconDeviceMobile}
      className={cn("text-slate-800")}
    />
  ),
  theater: (
    <Icon
      size="2em"
      icon={IconTheater}
      className={cn("text-slate-800")}
    />
  ),
} as const satisfies Record<SubscriptionIconModel, ReactElement>;
