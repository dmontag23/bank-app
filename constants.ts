import {Category, CategoryAssociations} from "./types/transaction";

export const INITIAL_CATEGORY_MAP: Record<Category, CategoryAssociations> = {
  [Category.BILLS]: {icon: "card-text-outline", color: "rgb(200, 34, 22)"},
  [Category.BUSINESS]: {icon: "account-tie", color: "rgb(163, 38, 38)"},
  [Category.CASH]: {icon: "cash-minus", color: "rgb(27, 135, 41)"},
  [Category.CHARITY]: {icon: "charity", color: "rgb(212, 92, 170)"},
  [Category.CLOTHES]: {
    icon: "tshirt-crew-outline",
    color: "rgb(252, 226, 54)"
  },
  [Category.COFFEE]: {icon: "coffee-outline", color: "rgb(110, 96, 9)"},
  [Category.DRINKS]: {icon: "glass-cocktail", color: "rgb(255, 184, 17)"},
  [Category.EATING_OUT]: {
    icon: "food-fork-drink",
    color: "rgb(162, 14, 157)"
  },
  [Category.ENTERTAINMENT]: {
    icon: "movie-open-outline",
    color: "rgb(14, 120, 109)"
  },
  [Category.FITNESS]: {icon: "heart-pulse", color: "rgb(240, 149, 39)"},
  [Category.GAMING]: {
    icon: "gamepad-variant-outline",
    color: "rgb(245, 8, 209)"
  },
  [Category.GIFTS]: {icon: "gift-outline", color: "rgb(120, 227, 49)"},
  [Category.GROCERIES]: {icon: "carrot", color: "rgb(245, 200, 64)"},
  [Category.HOLIDAYS]: {icon: "airplane-takeoff", color: "rgb(228, 225, 15)"},
  [Category.HOME]: {icon: "home-outline", color: "rgb(37, 102, 205)"},
  [Category.INCOME]: {icon: "cash-plus", color: "rgb(27, 135, 41)"},
  [Category.MEDICAL]: {icon: "medical-bag", color: "rgb(203, 21, 197)"},
  [Category.MORTGAGE]: {icon: "home-plus", color: "rgb(14, 203, 220)"},
  [Category.RENT]: {icon: "home-city-outline", color: "rgb(238, 82, 20)"},
  [Category.SAVINGS]: {icon: "cash-lock", color: "rgb(93, 201, 20)"},
  [Category.SHOPPING]: {icon: "shopping-outline", color: "rgb(227, 231, 18)"},
  [Category.TRANSPORT]: {icon: "train", color: "rgb(13, 128, 150)"},
  [Category.UNKNOWN]: {icon: "head-question", color: "rgb(117, 121, 122)"}
};
