import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppState, LogEntry, Piece, TempoMark } from "./types";
import { buildWeek, currentPhase } from "./engine/plan";
import { emptyState, loadState, saveState, uid } from "./store/model";
import type { SessionLogInput, StoreValue } from "./store/model";

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const week = useMemo(
    () => buildWeek({ profile: state.profile, pieces: state.pieces, log: state.log }),
    [state.profile, state.pieces, state.log, state.tempos],
  );

  const phaseInfo = useMemo(() => currentPhase(state.profile), [state.profile]);

  const updateProfile = useCallback((patch: Partial<AppState["profile"]>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const addPiece = useCallback((input: Omit<Piece, "id">) => {
    const id = uid();
    setState((prev) => ({ ...prev, pieces: [...prev.pieces, { ...input, id }] }));
    return id;
  }, []);

  const updatePiece = useCallback((id: string, patch: Partial<Piece>) => {
    setState((prev) => ({
      ...prev,
      pieces: prev.pieces.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const removePiece = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      pieces: prev.pieces.filter((p) => p.id !== id),
      profile: prev.profile.focusPieceId === id ? { ...prev.profile, focusPieceId: undefined } : prev.profile,
    }));
  }, []);

  const setFocusPiece = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, focusPieceId: id ?? undefined } }));
  }, []);

  const logSession = useCallback((input: SessionLogInput) => {
    const entry: LogEntry = {
      id: uid(),
      date: input.date,
      minutes: input.minutes,
      plannedMinutes: input.plannedMinutes,
      phase: input.phase,
      blocks: input.blocks,
      note: input.note,
    };
    setState((prev) => ({ ...prev, log: [...prev.log.filter((e) => e.date !== input.date), entry] }));
  }, []);

  const deleteLog = useCallback((id: string) => {
    setState((prev) => ({ ...prev, log: prev.log.filter((e) => e.id !== id) }));
  }, []);

  const addTempo = useCallback((input: Omit<TempoMark, "id">) => {
    setState((prev) => ({ ...prev, tempos: [...prev.tempos, { ...input, id: uid() }] }));
  }, []);

  const deleteTempo = useCallback((id: string) => {
    setState((prev) => ({ ...prev, tempos: prev.tempos.filter((t) => t.id !== id) }));
  }, []);

  const removeAll = useCallback(() => {
    setState(emptyState());
  }, []);

  const value: StoreValue = {
    state,
    ready,
    week,
    phase: phaseInfo.phase,
    daysToGoal: phaseInfo.daysToGoal,
    weeksToGoal: phaseInfo.weeksToGoal,
    updateProfile,
    addPiece,
    updatePiece,
    removePiece,
    setFocusPiece,
    logSession,
    deleteLog,
    addTempo,
    deleteTempo,
    removeAll,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
