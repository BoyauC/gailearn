'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { manualCloseDeadlineMillis, submissionDeadlineMillis } = require('../src/lifecycle');

const timestamp = (milliseconds) => ({ toMillis: () => milliseconds });
const GRACE_MS = 10 * 60 * 1000;

test('an open class accepts submissions through the ten-minute grace period after automatic closing', () => {
  const activeUntil = 1_000_000;
  const deadline = submissionDeadlineMillis({ status: 'open', activeUntil: timestamp(activeUntil) }, GRACE_MS);
  assert.equal(deadline, activeUntil + GRACE_MS);
});

test('a manually closed class uses its stored submission deadline', () => {
  const deadline = 2_000_000;
  assert.equal(submissionDeadlineMillis({ status: 'closed', submissionsCloseAt: timestamp(deadline) }, GRACE_MS), deadline);
});

test('closing after automatic expiry does not extend the grace period', () => {
  const activeUntil = 1_000_000;
  const now = activeUntil + GRACE_MS + 5_000;
  assert.equal(manualCloseDeadlineMillis({ activeUntil: timestamp(activeUntil) }, now, GRACE_MS), activeUntil + GRACE_MS);
});

test('closing before automatic expiry grants ten minutes from the manual close', () => {
  const activeUntil = 2_000_000;
  const now = 1_000_000;
  assert.equal(manualCloseDeadlineMillis({ activeUntil: timestamp(activeUntil) }, now, GRACE_MS), now + GRACE_MS);
});