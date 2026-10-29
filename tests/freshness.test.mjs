import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewState,reviewLabel} from '../assets/freshness.mjs';
import {renderReview} from '../assets/view.mjs';
const record={last_verified:'2026-10-29',verified_firmware:null,provenance:{verification_status:'source-reviewed-not-tested'}};
test('review age uses whole UTC dates and is due only after 45 days',()=>{
  assert.equal(reviewState(record,new Date('2026-12-13T23:59:59Z')),'current');
  assert.equal(reviewState(record,new Date('2026-12-14T00:00:00Z')),'due');
  assert.equal(reviewState(record,new Date('2026-10-28T23:59:59Z')),'unknown');
  assert.equal(reviewState({...record,last_verified:'bad'}),'unknown');
  assert.equal(reviewState({...record,last_verified:'2026-02-31'}),'unknown');
});
test('freshness preserves the difference between import, source review and firmware testing',()=>{
  assert.ok(reviewLabel(record,'due').includes('Source reviewed Oct 29, 2026 · Review due'));
  assert.ok(reviewLabel(record).includes('Not tested'));
  assert.ok(reviewLabel({...record,provenance:{verification_status:'imported-not-tested'}}).startsWith('Imported'));
  assert.ok(reviewLabel({...record,verified_firmware:'example-version'}).includes('Firmware tested: example-version'));
  assert.ok(!reviewLabel({...record,last_verified:'bad'},'unknown').includes('Invalid Date'));
});
test('generated badges remain stable across time and escape imported metadata',()=>{
  const html=renderReview({...record,verified_firmware:'<script>bad()</script>'});
  assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('data-review-date="2026-10-29"'));
  assert.ok(!html.includes('Review due'));
});
