import { create } from "zustand"

type NavBarState = {
  visparkResetToken: number
  isSummaryComplete: boolean
  triggerVisparkReset: () => void
  setSummaryComplete: (complete: boolean) => void
}

export const useNavBarStore = create<NavBarState>((set) => ({
  visparkResetToken: 0,
  isSummaryComplete: false,
  triggerVisparkReset: () =>
    set((s) => ({
      visparkResetToken: s.visparkResetToken + 1,
      isSummaryComplete: false,
    })),
  setSummaryComplete: (complete) => set({ isSummaryComplete: complete }),
}))
