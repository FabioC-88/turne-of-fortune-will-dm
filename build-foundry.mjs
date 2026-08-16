#!/usr/bin/env node
/**
 * build-foundry.mjs
 *
 * Converte i file Markdown della campagna in Compendium Packs di JournalEntry
 * compatibili con Foundry VTT V12+.
 *
 * Flusso:
 *   1. Legge tutti i .md dalle cartelle sorgente
 *   2. Converte Markdown → HTML con marked
 *   3. Genera oggetti JSON in formato JournalEntry (Foundry V10+)
 *   4. Salva i JSON in src/{pack-name}/
 *   5. Chiama `fvtt package pack` per compilare ogni pack in LevelDB (packs/{pack-name}/)
 *
 * Utilizzo:
 *   npm install
 *   npm run build
 *
 * Dopo il build: ricarica il World in Foundry (F5 o "Return to Setup → Launch").
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { marked } from 'marked';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const MODULE_ID = 'turne-of-fortune-will-dm';

// ── Utility ────────────────────────────────────────────────────────────────

/** ID deterministico a 16 caratteri hex da una stringa seed. */
function makeId(seed) {
  return createHash('sha256').update(seed).digest('hex').slice(0, 16);
}

/** Converti nome file (kebab-case, CamelCase, underscore) in titolo leggibile. */
function fileToTitle(filePath) {
  const name = basename(filePath, extname(filePath));
  return name
    .replace(/([A-Z])/g, ' $1')   // CamelCase → spazi
    .replace(/[-_]/g, ' ')         // kebab/snake → spazi
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
}

/** Estrae YAML frontmatter (---\nkey: value\n---) dal contenuto markdown. */
function parseFrontmatter(mdContent) {
  const match = mdContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { content: mdContent, data: {} };
  const data = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) data[m[1].trim()] = m[2].trim();
  }
  return { content: mdContent.slice(match[0].length), data };
}

/** Ordine fisso per i file del pack Campagna. */
const CAMPAGNA_ORDER = ['contesto', 'party', 'fazioni', 'rapporti', 'png-incontrati', 'missioni-secondarie', 'filo-narrativo-interno'];
function campagnaSortKey(filePath) {
  const name = basename(filePath, extname(filePath)).toLowerCase();
  const idx = CAMPAGNA_ORDER.indexOf(name);
  return idx >= 0 ? idx : 99;
}

/** Raccoglie tutti i file .md in modo ricorsivo. */
function collectMdFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMdFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ── Conversione MD → JournalEntry JSON ────────────────────────────────────

/**
 * Genera un oggetto JournalEntry Foundry V10+ da un file Markdown.
 * Gli ID sono deterministici (basati sul path relativo) per garantire
 * stabilità tra build successive senza ricreate i compendi.
 */
function buildJournalEntry(filePath) {
  const relPath     = relative(ROOT, filePath).replace(/\\/g, '/');
  const journalId   = makeId(relPath);
  const pageId      = makeId(relPath + ':page0');
  const mdContent   = readFileSync(filePath, 'utf-8');
  const { content, data } = parseFrontmatter(mdContent);
  const htmlContent = marked.parse(content);
  const now         = Date.now();
  let title         = fileToTitle(filePath);
  if (data.status) title = `${title} [${data.status}]`;

  return {
    _id:   journalId,
    name:  title,
    pages: [
      {
        _id:   pageId,
        name:  title,
        type:  'text',
        title: { show: false, level: 1 },
        text:  { format: 1, content: htmlContent },
        image: {},
        video: { controls: true, volume: 0.5 },
        src:    null,
        system: {},
        sort:   100000,
        ownership: { default: -1 },
        flags: {},
        _key: `!journal.pages!${journalId}.${pageId}`
      }
    ],
    folder:    null,
    sort:      0,
    ownership: { default: 0 },
    flags:     {},
    _stats: {
      systemId:       null,
      systemVersion:  null,
      coreVersion:    '14.0.0',
      createdTime:    now,
      modifiedTime:   now,
      lastModifiedBy: MODULE_ID
    },
    _key: `!journal!${journalId}`
  };
}

/** Raggruppa più file markdown in un unico JournalEntry multi-pagina. */
function buildMultiPageJournalEntry(journalTitle, seedId, files) {
  const journalId = makeId(seedId);
  const now = Date.now();
  const pages = files.map((filePath, i) => {
    const relPath = relative(ROOT, filePath).replace(/\\/g, '/');
    const pageId = makeId(relPath + ':page0');
    const mdContent = readFileSync(filePath, 'utf-8');
    const { content } = parseFrontmatter(mdContent);
    const pageTitle = fileToTitle(filePath);
    return {
      _id:   pageId,
      name:  pageTitle,
      type:  'text',
      title: { show: true, level: 1 },
      text:  { format: 1, content: marked.parse(content) },
      image: {},
      video: { controls: true, volume: 0.5 },
      src:    null,
      system: {},
      sort:   (i + 1) * 100000,
      ownership: { default: -1 },
      flags: {},
      _key: `!journal.pages!${journalId}.${pageId}`
    };
  });
  return {
    _id:   journalId,
    name:  journalTitle,
    pages,
    folder:    null,
    sort:      999 * 100000,
    ownership: { default: 0 },
    flags:     {},
    _stats: {
      systemId:       null,
      systemVersion:  null,
      coreVersion:    '14.0.0',
      createdTime:    now,
      modifiedTime:   now,
      lastModifiedBy: MODULE_ID
    },
    _key: `!journal!${journalId}`
  };
}

/** Legge module.json, incrementa la patch version (3 cifre) e riscrive solo quella riga. */
function bumpVersion() {
  const moduleJsonPath = join(ROOT, 'module.json');
  let raw = readFileSync(moduleJsonPath, 'utf-8');
  const match = raw.match(/"version":\s*"([\d.]+)"/);
  if (!match) throw new Error('Versione non trovata in module.json');
  const parts = match[1].split('.').slice(0, 3).map(Number);
  parts[2] = (parts[2] || 0) + 1;
  const newVersion = parts.join('.');
  raw = raw.replace(/"version":\s*"[\d.]+"/, `"version": "${newVersion}"`);
  writeFileSync(moduleJsonPath, raw, 'utf-8');
  return newVersion;
}

// ── Definizione Pack ───────────────────────────────────────────────────────

const PACKS = [
  {
    name: 'pg-backgrounds',
    label: 'Background PG',
    dirs: ['fonti/personaggi', 'campagna/png-per-capitolo']
  },
  {
    name: 'campagna',
    label: 'Note Campagna',
    dirs: ['campagna'],
    sessionDir: 'campagna/sessioni',
    locationsDir: 'campagna/luoghi-visitati'
  },
  {
    name: 'campagna-completa',
    label: "Turn of Fortune's Wheel — Sorgente Completa",
    dirs: ['fonti/campagna']
  }
];

// ── Build ──────────────────────────────────────────────────────────────────

console.log("\n🎲 Turn of Fortune's Wheel DM — Build Foundry Packs\n");

// Allow skipping the automatic version bump when environment variable
// SKIP_BUMP=1 (useful to regenerate assets for an existing release).
const SKIP_BUMP = process.env.SKIP_BUMP === '1' || process.env.SKIP_BUMP === 'true';
let newVersion;
if (SKIP_BUMP) {
  const moduleJsonPath = join(ROOT, 'module.json');
  const raw = readFileSync(moduleJsonPath, 'utf-8');
  const match = raw.match(/"version":\s*"([\d.]+)"/);
  newVersion = match ? match[1] : '0.0.0';
} else {
  newVersion = bumpVersion();
}
console.log(`📌 Versione: ${newVersion}\n`);

let totalEntries = 0;
const builtPacks = [];

for (const pack of PACKS) {
  // Raccoglie tutti i file .md per questo pack
  let mdFiles = pack.dirs.flatMap(d => collectMdFiles(join(ROOT, d)));

  if (mdFiles.length === 0) {
    console.log(`⏭  ${pack.name} — nessun file .md, skip\n`);
    continue;
  }

  console.log(`📦 Pack: ${pack.label} (${mdFiles.length} file)`);

  // 1. Genera JSON sorgente in src/{pack}/
  const srcDir = join(ROOT, 'src', pack.name);
  mkdirSync(srcDir, { recursive: true });

  // Rimuovi vecchi JSON per evitare residui di file rinominati
  for (const f of readdirSync(srcDir).filter(x => x.endsWith('.json'))) {
    rmSync(join(srcDir, f));
  }

  // Separa i file di sessione dal resto (verranno uniti in un journal multi-pagina)
  let sessionFiles = [];
  if (pack.sessionDir) {
    const sessionDirAbs = join(ROOT, pack.sessionDir);
    sessionFiles = mdFiles.filter(f => f.startsWith(sessionDirAbs));
    mdFiles = mdFiles.filter(f => !f.startsWith(sessionDirAbs));
  }

  // Separa i file locations dal resto (verranno uniti in un journal multi-pagina)
  let locationsFiles = [];
  if (pack.locationsDir) {
    const locationsDirAbs = join(ROOT, pack.locationsDir);
    locationsFiles = mdFiles.filter(f => f.toLowerCase().startsWith(locationsDirAbs.toLowerCase()));
    mdFiles = mdFiles.filter(f => !f.toLowerCase().startsWith(locationsDirAbs.toLowerCase()));
  }

  // Ordina: ordine fisso per Campagna, ordine alfabetico per gli altri pack
  if (pack.name === 'campagna') {
    mdFiles.sort((a, b) => campagnaSortKey(a) - campagnaSortKey(b));
  } else {
    mdFiles.sort();
  }

  for (const filePath of mdFiles) {
    const journal  = buildJournalEntry(filePath);
    const outPath  = join(srcDir, `${journal._id}.json`);
    writeFileSync(outPath, JSON.stringify(journal, null, 2), 'utf-8');
    const relFile  = relative(ROOT, filePath).replace(/\\/g, '/');
    console.log(`   ✓ ${journal._id}  "${journal.name}"  (${relFile})`);
    totalEntries++;
  }

  // Journal multi-pagina per le note di sessione
  if (sessionFiles.length > 0) {
    sessionFiles.sort();
    const sessioni = buildMultiPageJournalEntry('Sessioni', 'campagna:sessioni', sessionFiles);
    const outPath  = join(srcDir, `${sessioni._id}.json`);
    writeFileSync(outPath, JSON.stringify(sessioni, null, 2), 'utf-8');
    console.log(`   ✓ ${sessioni._id}  "${sessioni.name}"  (${sessionFiles.length} pagine)`);
    totalEntries++;
  }

  // Journal multi-pagina per i luoghi visitati
  if (locationsFiles.length > 0) {
    locationsFiles.sort();
    const luoghi = buildMultiPageJournalEntry('Luoghi Visitati', 'campagna:luoghi-visitati', locationsFiles);
    const outPath  = join(srcDir, `${luoghi._id}.json`);
    writeFileSync(outPath, JSON.stringify(luoghi, null, 2), 'utf-8');
    console.log(`   ✓ ${luoghi._id}  "${luoghi.name}"  (${locationsFiles.length} pagine)`);
    totalEntries++;
  }

  // 2. Compila LevelDB con fvtt-cli
  // Il CLI crea automaticamente una sottocartella con il nome del compendio
  // dentro outputDirectory: packs/{pack.name}/
  const packsRootDir = join(ROOT, 'packs');
  mkdirSync(packsRootDir, { recursive: true });

  try {
    execSync(
      `npx fvtt package pack` +
      ` --id ${MODULE_ID} --type Module` +
      ` --compendiumName "${pack.name}" --compendiumType JournalEntry` +
      ` --inputDirectory "${srcDir}" --outputDirectory "${packsRootDir}"`,
      { stdio: 'inherit', cwd: ROOT }
    );
    console.log(`   ✅ Pack compilato → packs/${pack.name}\n`);
    builtPacks.push(pack.name);
  } catch (err) {
    console.error(`   ❌ Errore compilazione pack ${pack.name}:`);
    console.error(`      ${err.message}\n`);
  }
}

// ── Riepilogo ──────────────────────────────────────────────────────────────

console.log('─'.repeat(60));
console.log(`✅ Build completata  (v${newVersion})`);
console.log(`   Journal Entry generate : ${totalEntries}`);
console.log(`   Pack compilati         : ${builtPacks.length} (${builtPacks.join(', ')})`);
console.log('');
console.log('Prossimo passo: ricarica il tuo World in Foundry VTT (F5 o');
console.log('"Return to Setup → Launch World") per vedere i pack aggiornati.');
console.log('');
