import React from "react";
import { PuzzleDefinition } from "../core/types.js";
import { Language, localizePuzzle, messages } from "../i18n.js";
import {
  DailyScheduleEntry,
  getDailyEntryStatus,
  getUtcDateKey,
} from "../data/dailySchedule.js";

export interface DailyArchiveModalProps {
  isOpen: boolean;
  entries: DailyScheduleEntry[];
  puzzles: PuzzleDefinition[];
  currentDate: string | null;
  language: Language;
  onSelect: (entry: DailyScheduleEntry, puzzle: PuzzleDefinition) => void;
  onClose: () => void;
}

export const DailyArchiveModal: React.FC<DailyArchiveModalProps> = ({
  isOpen,
  entries,
  puzzles,
  currentDate,
  language,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  const text = messages[language];
  const today = getUtcDateKey();
  const dateFormatter = new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  const statusText = {
    archived: text.dailyArchived,
    today: text.dailyToday,
    upcoming: text.dailyUpcoming,
    unavailable: text.dailyUnavailable,
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-archive-title"
      onClick={(event) => {
        if ((event.target as HTMLElement).classList.contains("modal-backdrop")) onClose();
      }}
    >
      <section className="modal-card modal-card-wide daily-archive-card">
        <header className="modal-header daily-archive-header">
          <div className="selector-icon" aria-hidden="true">▦</div>
          <h2 id="daily-archive-title" className="victory-title">
            {text.dailyArchiveTitle}
          </h2>
          <p className="victory-subtitle">{text.dailyArchiveDescription}</p>
        </header>

        <div className="daily-archive-grid">
          {entries.map((entry) => {
            const status = getDailyEntryStatus(entry, today);
            const puzzle = entry.puzzleId
              ? puzzles.find((candidate) => candidate.id === entry.puzzleId)
              : undefined;
            const isLocked = status === "upcoming" || status === "unavailable";
            const isCurrent = currentDate === entry.date;
            const displayPuzzle = puzzle ? localizePuzzle(puzzle, language) : undefined;
            const dateLabel = dateFormatter.format(new Date(`${entry.date}T12:00:00Z`));

            return (
              <button
                key={entry.date}
                type="button"
                className={`daily-date-card daily-date-${status}${isCurrent ? " daily-date-selected" : ""}`}
                disabled={isLocked || !puzzle}
                aria-label={`${dateLabel}: ${statusText[status]}${isLocked ? `, ${text.dailyLocked}` : displayPuzzle ? `, ${displayPuzzle.title}` : ""}`}
                onClick={() => puzzle && !isLocked && onSelect(entry, puzzle)}
              >
                <span className="daily-date-topline">
                  <time dateTime={entry.date}>{dateLabel}</time>
                  <span className="daily-status-badge">{statusText[status]}</span>
                </span>
                <strong className="daily-date-title">
                  {status === "upcoming" ? text.dailyLocked : status === "unavailable" ? text.dailyUnavailable : displayPuzzle?.title ?? entry.puzzleId}
                </strong>
                {!isLocked && displayPuzzle?.description && (
                  <span className="daily-date-description">{displayPuzzle.description}</span>
                )}
                {displayPuzzle && !isLocked && (
                  <span className="daily-date-meta">
                    {text.topics[displayPuzzle.topic]} · {text.difficulties[displayPuzzle.difficulty ?? "medium"]}
                  </span>
                )}
                {!isLocked && status === "today" && (
                  <span className="daily-play-label">{text.dailyPlay} →</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {text.close}
          </button>
        </div>
      </section>
    </div>
  );
};
