'use strict';

function timestampMillis(value) {
  return value && typeof value.toMillis === 'function' ? value.toMillis() : null;
}

function submissionDeadlineMillis(session, graceMs) {
  if (!Number.isFinite(graceMs) || graceMs < 0) throw new TypeError('A valid grace period is required.');
  if (session.status === 'open') {
    const activeUntil = timestampMillis(session.activeUntil);
    return activeUntil ? activeUntil + graceMs : null;
  }
  return timestampMillis(session.submissionsCloseAt);
}

function manualCloseDeadlineMillis(session, now, graceMs) {
  if (!Number.isFinite(graceMs) || graceMs < 0) throw new TypeError('A valid grace period is required.');
  const activeUntil = timestampMillis(session.activeUntil);
  return activeUntil && activeUntil <= now ? activeUntil + graceMs : now + graceMs;
}

module.exports = { manualCloseDeadlineMillis, submissionDeadlineMillis, timestampMillis };