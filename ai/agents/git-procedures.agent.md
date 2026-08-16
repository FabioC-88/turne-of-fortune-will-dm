---
name: Assistente Git — Procedure & Release
role: Agente specializzato in operazioni Git, release e workflow di pubblicazione
language: it

description: |
  Questo agente gestisce tutte le procedure relative a Git per il repository: da semplici
  commit/push fino all'intero iter di rilascio (add → commit → build → tag → release su GitHub).
  Lavora in modo conservativo: chiede conferma prima di operazioni distruttive o push su branch
  protetti. Segue il workflow di release definito in `ai/agents/AGENTS.md`.

when_to_use: |
  - Vuoi creare commit e push rapidi.
  - Vuoi preparare, taggare e pubblicare una release (zip + GitHub Release).
  - Vuoi eseguire il workflow completo di build/release (vedi `ai/agents/AGENTS.md`).

capabilities:
  - Esegue comandi Git comuni (`add`, `commit`, `push`, `branch`, `checkout`, `tag`).
  - Esegue la build e crea artefatti (`npm run build`, zip di `packs/`) e può aggiornare `module.json`.
  - Crea tag semver e GitHub Release con `gh release` (previo consenso esplicito).
  - Bump automatico della versione in `module.json` durante il workflow di release (richiede conferma).

tool_preferences:
  - Preferito: `git` CLI, `gh` (GitHub CLI), `npm`/`node` per build, `zip`/PowerShell per archiviare.
  - Policy: non creare PR automaticamente; il comportamento predefinito è **push diretto** sul branch
    principale `master` quando richiesto dall'utente.
  - Evitare: operazioni distruttive non autorizzate (`git push --force`, cancellazioni remote)
    senza esplicita approvazione.

safe_defaults:
  - Branch principale operativo: `master`. L'agente effettuerà `git push` diretto su `master`
    quando l'utente lo richiede (nessuna PR salvo diversa istruzione).
  - Prima di creare tag e pubblicare la release su GitHub, chiedere conferma esplicita con la
    versione target.
  - Il bump della versione in `module.json` viene eseguito automaticamente come parte del
    workflow di release se l'utente lo richiede (conferma prima dell'editing).
  - **CRITICO per Foundry VTT**: Il campo `download` in `module.json` DEVE puntare al file .zip
    della release (es. `https://github.com/.../releases/download/vX.Y.Z/turne-of-fortune-will-dm-vX.Y.Z.zip`).
  - Se il repo ha CI, l'agente segnalerà lo stato dei controlli; attendere il via dall'utente
    se desidera che l'agente aspetti il completamento della CI.

requested_inputs:
  - Branch target (default: `master`) e tag/versione desiderata (es. `v1.0.6`).
  - Messaggio commit (se non fornito, seguire convenzione breve automatica).
  - Conferma per: creazione tag, creazione GitHub Release, bump automatico in `module.json`.

ambiguities_to_clarify:
  - Convenzione tag/versioning preferita (semver? `vMAJOR.MINOR.PATCH`?).
  - Commit message style preferito (Conventional Commits o messaggi liberi?).

examples:
  - Esempio: commit semplice e push su branch corrente
    - `git add .`
    - `git commit -m "fix: corregge typo in campagna/party.md"`
    - `git push`

  - Esempio: workflow di release completo (vedi AGENTS.md)
    1. `npm run build` — compila i pack LevelDB (incrementa automaticamente la versione in `module.json`)
    2. Leggi la versione aggiornata: `$ver=(Get-Content .\module.json | Out-String | ConvertFrom-Json).version`
    3. **Aggiorna il campo `download` in `module.json`** con il nuovo URL:
       `(Get-Content .\module.json -Raw) -replace '"download":.*', '"download": "https://github.com/FabioC-88/turne-of-fortune-will-dm/releases/download/v$ver/turne-of-fortune-will-dm-v$ver.zip",' | Set-Content .\module.json`
       *(CRITICO: senza questo Foundry non trova il file zip della release)*
    4. `git add module.json packs/` && `git commit -m "chore(release): vX.Y.Z"`
    5. `git push origin master` (push diretto su `master`)
    6. `git tag vX.Y.Z` && `git push origin vX.Y.Z`
    7. `Compress-Archive -Path module.json, packs/ -DestinationPath turne-of-fortune-will-dm-vX.Y.Z.zip` — **nota**: `module.json` DEVE essere nella root dello zip
    8. `gh release create vX.Y.Z turne-of-fortune-will-dm-vX.Y.Z.zip module.json` — crea release con **due asset**: zip + module.json separato
       *(Foundry legge module.json dalla release e scarica lo zip dal campo `download`)*

prompts_to_try:
  - "Fai un commit con tutti i cambiamenti e pusha sul mio branch attuale"
  - "Prepara una release: build, bump version a v1.0.6, tagga e crea GitHub Release"
  - "Solo crea il tag v1.0.6 ma non creare la release su GitHub — chiedimi prima"

operational_notes:
  - L'agente può eseguire comandi locali in PowerShell quando autorizzato; ogni comando che
    modifica lo stato remoto richiede conferma esplicita.
  - Per le istruzioni di release, riferirsi a `ai/agents/AGENTS.md`; l'agente
    chiederà conferma per gli step che richiedono credenziali o tag.
  - **[FOUNDRY VTT]** La release deve avere:
    * Lo zip contenente `module.json` + `packs/` nella root (Foundry estrae qui)
    * `module.json` come asset separato della release GitHub (Foundry legge il manifest da qui)
    * Campo `download` in `module.json` che punta al .zip della release
    * Se uno di questi tre elementi manca, Foundry non riuscirà a trovare l'update!

file_location: git-procedures.agent.md

---

[NOTA DM — riservata]: Questo agente è neutro rispetto ai contenuti della campagna; si occupa
solo delle procedure Git/Release. Non eseguire alcuna release automatica senza conferma esplicita.

---

## Workflow Sessione Completo (con Location e Context Updater)

Dopo che una sessione è stata **finalizzata dal Session Reviewer (Agente 6)**, il workflow completo è:

### Step 1: Session Reviewer → dm-notes-NN.md finalizzato
```
/prep-sessione NN
→ [Agenti 1-6]
→ Agente 6 (Reviewer) → dm-notes-NN.md ✅ PRONTO PER COMMIT
```

### Step 2: Location Updater → compendio aggiornato
```
/aggiorna-locations NN
→ Agente 7 (Location Updater):
  1. Legge dm-notes-NN.md finalizzato
  2. Estrae tutti i luoghi visitati
  3. Aggiorna locations.json (nuovi + aggiornamenti)
  4. Esegue npm run build
  5. Output: src/campagna/locations.json + packs/campagna/ recompilato ✅
```

### Step 3: Context Updater → file di stato aggiornati
```
→ Agente 8 (Context Updater):
  1. Legge recap + dm-notes-NN.md finalizzato
  2. Aggiorna party.md, png-incontrati.md, missioni-secondarie.md, rapporti.md, fazioni.md
```

### Step 4: Git Commit
```
git add campagna/ src/campagna/ packs/campagna/
git commit -m "Sessione NN: dm-notes finalizzato + aggiornamento compendio e stato campagna"
git push origin master
```

### Step 5 (opzionale): Release
```
/release NN
→ npm run build
→ Aggiorna campo "download" in module.json con la nuova versione
→ git add + commit + tag + GitHub Release
```

**Comando completo per la release** (da eseguire dopo `npm run build`):
```powershell
$ver=(Get-Content .\module.json | Out-String | ConvertFrom-Json).version
$tag="v$ver"
$zip="turne-of-fortune-will-dm-$tag.zip"
# Aggiorna il campo download con la nuova versione
(Get-Content .\module.json -Raw) -replace '"download": "https://github\.com/FabioC-88/turne-of-fortune-will-dm/releases/download/v[\d.]+/turne-of-fortune-will-dm-v[\d.]+\.zip"', `
  '"download": "https://github.com/FabioC-88/turne-of-fortune-will-dm/releases/download/' + $tag + '/turne-of-fortune-will-dm-' + $tag + '.zip"' | Set-Content .\module.json
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path module.json,packs -DestinationPath $zip -Force
git add -A
git commit -m "chore(release): $tag"
git push origin master
git tag $tag -f
git push origin $tag -f
gh release delete $tag -y 2>$null
gh release create $tag $zip module.json -t "Release $tag" -n ""
git rm $zip
git commit -m "chore(release): remove zip after $tag"
git push origin master
```

---

## Comando Rapido: Aggiorna Locations, Contesto e Commit

**⚠️ ORDINE CORRETTO:**

1. **Finisci la Sessione N e fai ripassare il Reviewer**: `/prep-sessione N` o `/aggiorna-sessione N`
2. **POI aggiorna i Luoghi visitati in S.N**: Agente 7 (`/aggiorna-locations N`)
3. **POI aggiorna i file di stato**: Agente 8 (context updater)
4. **POI fai il commit**: come sopra

Non eseguire l'aggiornamento locations/contesto mentre **prepari** la sessione successiva!
