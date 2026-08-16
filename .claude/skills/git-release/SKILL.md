---
name: git-release
description: >
  Workflow completo di release per il modulo Foundry VTT Turn of Fortune's Wheel DM: build →
  aggiorna campo download in module.json → commit → tag → GitHub Release con zip + module.json
  separato. Usa questa skill ogni volta che vuoi pubblicare una nuova versione: "/git-release",
  "/git-release v1.0.6", "fai la release", "pubblica la versione su GitHub", "crea il tag e la
  release". Richiede conferma esplicita del DM prima di ogni operazione che modifica lo stato
  remoto (push, tag, release).
  NON usare per semplici commit/push senza release — per quelli usa git direttamente.
---

# Workflow Release Foundry VTT — /git-release

Gestisci la release completa del modulo Turn of Fortune's Wheel DM su GitHub e Foundry VTT.
Ogni operazione che modifica lo stato remoto (push, tag, GitHub Release) richiede conferma esplicita.
Se qualcosa va storto tra Step 5 e Step 9, fermati e segnala l'errore senza procedere oltre.

**Struttura critica della release Foundry** (tutti e tre gli elementi devono essere presenti):
- Zip contenente `module.json` + `packs/` nella root
- `module.json` come asset separato della release GitHub
- Campo `download` in `module.json` che punta allo zip

Se uno di questi manca, Foundry non trova l'aggiornamento.

---

## Step 0 — Verifica stato repo

```powershell
git status
git log --oneline -5
```

Mostra al DM cosa sta per essere incluso nella release. Se ci sono modifiche non committate
inattese, chiedi come procedere prima di andare avanti.

---

## Step 1 — Build

```powershell
npm run build
```

Verifica che il build abbia successo (output con `✓` e hash pack). Se il build fallisce, fermati.

---

## Step 2 — Leggi versione e repo

```powershell
$mod = Get-Content .\module.json | Out-String | ConvertFrom-Json
$ver = $mod.version
$repoId = $mod.id
```

Leggi anche il nome del proprietario dal remote:
```powershell
$remote = git remote get-url origin
# Estrai owner/repo dall'URL (es. https://github.com/FabioC-88/turne-of-fortune-will-dm)
```

Mostra al DM: `Versione attuale da module.json: vX.Y.Z`

Se il DM ha specificato una versione diversa nel comando (es. `/git-release v1.0.7`), usa quella
e chiedi conferma: "Vuoi usare vX.Y.Z invece di vX.Y.Z da module.json?"

---

## Step 3 — Aggiorna campo download (CRITICO)

Aggiorna il campo `download` in `module.json` con l'URL della release che stai per creare.
Il nome dello zip sarà `{repoId}-v{ver}.zip`.

```powershell
$tag = "v$ver"
$zip = "$repoId-$tag.zip"
$owner = # estratto dal remote in Step 2
$downloadUrl = "https://github.com/$owner/$repoId/releases/download/$tag/$zip"

$content = Get-Content .\module.json -Raw
$content = $content -replace '"download":.*?".*?"', "`"download`": `"$downloadUrl`""
Set-Content .\module.json $content
```

Verifica che il campo sia stato aggiornato correttamente leggendo `module.json`.

---

## Step 4 — Chiedi conferma

Prima di procedere con operazioni irreversibili, mostra al DM:

```
📦 Riepilogo release:

  Versione:        v{ver}
  File zip:        {repoId}-v{ver}.zip
  Campo download:  https://github.com/{owner}/{repoId}/releases/download/v{ver}/{repoId}-v{ver}.zip
  File da committare: module.json, packs/
  Tag da creare:   v{ver}
  GitHub Release:  sì, con 2 asset: zip + module.json separato

Confermato? (sì/no)
```

Se il DM risponde no, annulla tutto senza fare nulla.

---

## Step 5 — Commit e push

```powershell
git add module.json packs/
git commit -m "chore(release): $tag"
git push origin main
```

---

## Step 6 — Tag e push tag

```powershell
git tag $tag
git push origin $tag
```

---

## Step 7 — Crea zip

`module.json` deve essere nella root dello zip (non in sottocartella) — Foundry estrae qui.

```powershell
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path module.json,packs -DestinationPath $zip -Force
```

---

## Step 8 — Crea GitHub Release

La release deve avere DUE asset: lo zip e `module.json` separato.
Foundry legge il manifest da `module.json` e scarica lo zip dall'URL nel campo `download`.

```powershell
gh release create $tag $zip module.json -t "Release $tag" -n ""
```

---

## Step 9 — Pulizia

Rimuovi il file zip locale dopo l'upload (non va nel repo).

```powershell
git rm $zip
git commit -m "chore(release): remove zip after $tag"
git push origin main
```

---

## Step 10 — Verifica

```powershell
gh release view $tag
```

Conferma che la release sia stata creata con entrambi gli asset (zip + module.json).
Mostra il link al DM.

---

## Riepilogo finale

```
✅ Release completata

  Tag:      {tag}
  Release:  https://github.com/{owner}/{repoId}/releases/tag/{tag}
  Asset:    {repoId}-{tag}.zip  +  module.json

Foundry troverà l'aggiornamento all'URL del campo "download" in module.json.
```
