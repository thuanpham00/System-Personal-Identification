import { create } from "zustand";
import { getIsLoginFromLS, getNameUserFromLS } from "../utils/auth";

type AppStoreType = {
  nameUser: string;
  setNameUser: (nameUser: string) => void;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
};

export const useAppStore = create<AppStoreType>((set) => ({
  nameUser: getNameUserFromLS(),
  setNameUser: (nameUser: string) => set({ nameUser }),
  isLogin: getIsLoginFromLS(),
  setIsLogin: (isLogin: boolean) => set({ isLogin }),

  reset: () =>
    set({
      nameUser: "",
      isLogin: false,
    }),
}));
