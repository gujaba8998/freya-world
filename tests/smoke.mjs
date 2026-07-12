import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');

const requiredFiles = [
  'index.html', 'manifest.webmanifest', 'sw.js', 'fw-assets.js', 'fw-app.jsx', 'fw-data.jsx', 'fw-ui.jsx',
  'fw-firebase.jsx', 'fw-dashboard.jsx', 'fw-activity.jsx', 'fw-portfolio.jsx',
  'fw-rewards.jsx', 'fw-parent.jsx', 'fw-parenthub.jsx', 'fw-curriculum.jsx',
  'fw-styles.css', 'fw-responsive.css', 'fw-theme.css',
];

for (const file of requiredFiles) {
  assert.ok(existsSync(resolve(root, file)), `missing required app file: ${file}`);
}

const index = read('index.html');
const scriptSources = [...index.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
const localScripts = scriptSources.filter((src) => !/^https?:/.test(src));
for (const src of localScripts) {
  const file = src.split('?')[0];
  assert.ok(existsSync(resolve(root, file)), `index references missing script: ${src}`);
}

const position = (file) => {
  const found = scriptSources.findIndex((src) => src.split('?')[0] === file);
  assert.notEqual(found, -1, `index does not load ${file}`);
  return found;
};

assert.ok(position('fw-curriculum.jsx') < position('fw-data.jsx'), 'curriculum must load before app state');
assert.ok(position('fw-firebase.jsx') < position('fw-data.jsx'), 'Firebase helpers must load before app state');
assert.ok(position('fw-assets.js') < position('fw-data.jsx'), 'asset registry must load before app state');
assert.ok(position('fw-data.jsx') < position('fw-dashboard.jsx'), 'app state must load before feature components');
assert.ok(position('fw-data.jsx') < position('fw-ui.jsx'), 'app state must load before shared UI primitives');
assert.ok(position('fw-ui.jsx') < position('fw-dashboard.jsx'), 'shared UI primitives must load before feature components');
assert.ok(position('fw-parenthub.jsx') < position('fw-app.jsx'), 'feature components must load before app shell');

const data = read('fw-data.jsx');
for (const handler of [
  'acceptMission', 'submitMission', 'approveSubmission', 'rejectSubmission',
  'redeem', 'buyRoomItem', 'buyMascotItem', 'retryPendingUploads',
]) {
  assert.match(data, new RegExp(`const ${handler} = useCallback`), `missing critical handler: ${handler}`);
}

assert.match(data, /if \(stars < reward\.cost\)/, 'reward redemption must guard insufficient stars');
assert.match(data, /if \(stars < item\.cost\)/, 'item purchases must guard insufficient stars');
assert.match(data, /status: 'pending'/, 'mission submission must enter pending state');
assert.match(data, /status: 'done'/, 'mission approval must enter done state');
assert.match(data, /status: 'inprogress'.*returned: true/, 'rejected mission must return for revision');
assert.match(data, /outboxPut\(/, 'failed evidence uploads must enter the durable outbox');
assert.match(data, /outboxDelete\(/, 'successful retry must remove its outbox entry');

const firebase = read('fw-firebase.jsx');
for (const field of [
  'missions', 'stars', 'progress', 'wallet', 'portfolio', 'submissions', 'rewards',
  'profile', 'planDone', 'planEdits', 'room', 'streak', 'lootbox', 'stickers', 'mascotFit',
]) {
  assert.match(firebase, new RegExp(`\\b${field}:`), `Firestore serializer is missing ${field}`);
}
assert.match(firebase, /indexedDB\.open\(OUTBOX_DB/, 'IndexedDB outbox must remain available');

const theme = read('fw-theme.css');
const styles = read('fw-styles.css');
assert.match(theme, /:focus-visible/, 'visible keyboard focus styles are required');
assert.match(`${styles}\n${theme}`, /prefers-reduced-motion:\s*reduce/, 'reduced-motion support is required');

const appShell = read('fw-app.jsx');
const sharedUi = read('fw-ui.jsx');
const dashboard = read('fw-dashboard.jsx');
const rewardsUi = read('fw-rewards.jsx');
const portfolioUi = read('fw-portfolio.jsx');
const parentHubUi = read('fw-parenthub.jsx');
for (const destination of ['home', 'quests', 'world', 'portfolio', 'rewards']) {
  assert.match(appShell, new RegExp(`id: '${destination}'`), `child navigation is missing ${destination}`);
}
assert.match(appShell, /<nav aria-label=/, 'app shell navigation needs an accessible name');
assert.match(sharedUi, /role="dialog" aria-modal="true"/, 'shared overlays must expose dialog semantics');
assert.match(sharedUi, /event\.key === 'Escape'/, 'shared overlays must close with Escape');
assert.match(sharedUi, /openerRef\.current\.focus\(\)/, 'shared overlays must restore focus');

const manifest = JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.start_url, './');
for (const icon of manifest.icons ?? []) {
  assert.ok(existsSync(resolve(root, icon.src)), `manifest references missing icon: ${icon.src}`);
}

const serviceWorker = read('sw.js');
assert.match(serviceWorker, /const sameOrigin = url\.origin === location\.origin/, 'service worker origin boundary is missing');
assert.match(serviceWorker, /if \(!sameOrigin && !cdnRuntime\) return;/, 'Firebase and Storage traffic must bypass the service worker');
assert.doesNotMatch(serviceWorker, /['"]https:\/\/firestore\.googleapis\.com/, 'Firestore API must not be precached');
assert.match(serviceWorker, /'fw-assets\.js'/, 'asset registry must be precached');
assert.match(serviceWorker, /'fw-ui\.jsx'/, 'shared UI primitives must be precached');
assert.match(dashboard, /WORLD_PRESENTATION/, 'kid world map must keep presentation names separate from learning data');
assert.match(dashboard, /aria-label={`\$\{\(TERRITORY/, 'world destinations must expose descriptive accessible labels');
assert.match(dashboard, /world-detail-sheet/, 'world destinations must open an accessible detail sheet');
assert.match(dashboard, /QUEST_STATUS/, 'quest UI must use a consistent status taxonomy');
assert.match(dashboard, /quest-filters/, 'quest destination must provide status filters');
assert.match(dashboard, /compact onOpen={setSelectedMission}/, 'quest list must separate scanning from the detail and evidence flow');
assert.match(rewardsUi, /function RewardGlyph/, 'shop must provide code-native artwork when prepared assets are unavailable');
assert.match(rewardsUi, /buyRoomItem\(p\.item\)/, 'room purchases must keep the existing guarded action');
assert.match(rewardsUi, /buyMascotItem\(p\.item\)/, 'wardrobe purchases must keep the existing guarded action');
assert.match(rewardsUi, /else redeem\(p\.item\)/, 'real rewards must keep the existing guarded action');
assert.match(portfolioUi, /function MemoryCard/, 'portfolio must render learning entries as memory-book cards');
assert.match(portfolioUi, /item\.praiseAudio/, 'memory cards must preserve parent audio feedback');
assert.match(portfolioUi, /item\.indicators/, 'memory cards must expose curriculum indicators when present');
assert.match(parentHubUi, /function ParentOverview/, 'parent mode must provide an overview dashboard');
assert.match(parentHubUi, /Pending reviews/, 'parent overview must expose pending review status');
assert.match(parentHubUi, /Needs revision/, 'parent overview must expose revision status');

console.log(`Smoke checks passed (${requiredFiles.length} required files, ${localScripts.length} local scripts).`);
