import { create } from "zustand";

type ScoreActionsState = {
  actorSlotId: string | null;
  spectatorMode: boolean;
  setActorSlotId: (slotId: string | null) => void;
  setSpectatorMode: (spectator: boolean) => void;
};

export const useScoreActions = create<ScoreActionsState>((set) => ({
  actorSlotId: null,
  spectatorMode: true,
  setActorSlotId: (slotId) => set({ actorSlotId: slotId, spectatorMode: slotId === null }),
  setSpectatorMode: (spectator) => set({ spectatorMode: spectator }),
}));
