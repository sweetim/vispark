import { create } from "zustand"

type NavBarState = {
  visparkResetToken: number
  triggerVisparkReset: () => void
}

export const useNavBarStore = create<NavBarState>((set) => ({
  visparkResetToken: 0,
  triggerVisparkReset: () => set((s) => ({ visparkResetToken: s.visparkResetToken + 1 })),
}))
