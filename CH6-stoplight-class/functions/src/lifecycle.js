'use strict';

function timestampMillis(value) {
  return value && typeof value.toMillis === 'function' ? value.toMillis() : null;
}

function submissionDeadlineMillis(session, graceMs) {
  if (session.status === 'open') {
    const activeUntil = timestampMillis(session.activeUntil);
    return activeUntil ? activeUntil + graceMs : null;
  }
  return timestampMillis(session.submissionsCloseAt);
}

function manualCloseDeadlineMillis(session, now, graceMs) {
  const activeUntil = timestampMillis(session.activeUntil);
  return activeUntil && activeUntil <= now ? activeUntil + graceMs : now + graceMs;
}

module.exports = { manualCloseDeadlineMillis, submissionDeadlineMillis, timestampMillis };