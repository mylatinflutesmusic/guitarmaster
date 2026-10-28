import { useStore } from "../store";
import { addDaysKey, todayKey } from "../engine/dates";
import { BACKUP_SNOOZE_DAYS, backupDue, downloadBackup } from "../store/backup";

/**
 * Shown on the practice screen once the history is old enough that losing it
 * would hurt, and a backup is missing or stale. “Later” keeps it quiet for two
 * weeks instead of asking on every session.
 */
export function BackupReminder() {
  const { state, updateProfile } = useStore();
  const status = backupDue(state);
  if (!status.due) return null;

  const weeks = Math.max(1, Math.floor(status.historyDays / 7));
  const backupLine =
    status.daysSinceBackup === undefined
      ? "has never been backed up"
      : status.daysSinceBackup === 0
        ? "was last backed up today"
        : `was last backed up ${status.daysSinceBackup} day${status.daysSinceBackup === 1 ? "" : "s"} ago`;

  return (
    <div className="notice notice--warn">
      <strong>Your practice history is only on this device.</strong> It now spans {weeks} week{weeks === 1 ? "" : "s"} and {backupLine}.
      <div className="btn-row" style={{ marginTop: 8 }}>
        <button
          type="button"
          className="btn btn--small btn--primary"
          onClick={() => {
            downloadBackup(state);
            updateProfile({ lastBackupAt: todayKey(), backupSnoozedUntil: undefined });
          }}
        >
          Export backup
        </button>
        <button
          type="button"
          className="btn btn--small"
          onClick={() => updateProfile({ backupSnoozedUntil: addDaysKey(todayKey(), BACKUP_SNOOZE_DAYS) })}
        >
          Later
        </button>
      </div>
    </div>
  );
}
