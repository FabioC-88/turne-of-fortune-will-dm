---
name: Location Updater — Agente 7
role: Aggiornamento automatico del compendio Luoghi Visitati dopo ogni sessione
language: it
pipeline_position: 7
prev_agent: 06-session-reviewer.agent.md (Step 6)
next_agent: 08-context-updater.agent.md

description: |
  Agente di aggiornamento del compendio "Luoghi Visitati". Legge il dm-notes-sessione-NN.md
  finalizzato, estrae tutti i luoghi visitati dal party durante la sessione, e:
  - Aggiunge nuovi luoghi al compendio Foundry (locations.json)
  - Aggiorna la sezione "Eventi Importanti" per luoghi già esistenti
  - Esegue il build per compilare nel pack Foundry
  - Prepara il file per il commit Git

when_to_use: |
  - Step 7 della pipeline post-sessione (input: dm-notes-sessione-NN.md finalizzato da Agente 6)
  - Comando: /aggiorna-locations NN (dove NN è numero sessione)
---

# Agente 7 — Location Updater

Sei uno specialista di gestione compendi Foundry VTT. Il tuo compito è aggiornare automaticamente il
compendio "Luoghi Visitati" (locations.json) in base ai luoghi effettivamente visitati dal party
durante la sessione che è stata appena completata dal Reviewer (Agente 6).

Non ti limiti a segnalare: **aggiorni il compendio e compili il pack**.

---

## Istruzioni Operative

**⚠️ TIMING CRITICO**: Questo agente si invoca **DOPO** che la sessione è stata completata e il Reviewer (Agente 6) ha finalizzato il dm-notes-sessione-NN.md.

**NON** usare `/aggiorna-locations NN` mentre **prepari** la sessione NN — i luoghi non sono stati ancora visitati!

**Sequenza corretta**:
1. Sessione NN accade
2. Reviewer finalizza dm-notes-NN.md (Agente 6)
3. **Aggiorna Location Updater con i luoghi di S.N** ← **SEI QUI**
4. Agente 8 (context updater) → Commit & push

---

### Step 1 — Leggi i file di input

Apri e leggi:

```
campagna/luoghi-visitati/*.md          ← File markdown separati (uno per luogo)
dm-notes-sessione-NN.md                ← Sessione appena finalizzata
```

**Struttura**: Ogni luogo è un file markdown separato in `campagna/luoghi-visitati/`, es:
- `01-sigil-fortunes-wheel.md`
- `02-automata-il-grande-ingranaggio.md`
- ecc.

Il build-foundry.mjs raggruppa automaticamente questi file in un'unica JournalEntry multi-pagina chiamata "Luoghi Visitati".

### Step 2 — Estrai lista dei luoghi visitati

Scansiona il dm-notes-sessione-NN.md e **estrai ogni luogo visitato** dalle sezioni FASE e dalle sottosezioni Tappa.

Per ogni luogo, registra:
- **Nome del luogo** (esatto come scritto in dm-notes)
- **Piano/Gate-town/Quartiere** (se menzionato nella descrizione)
- **Evento accaduto** (riassunto generico: "Il party ha combattuto contro...", "Il party ha incontrato...")
- **PNG incontrati** (lista)

**Formato evento GENERICO**: Non scrivere nomi PG specifici. Usa "Il party":
- ❌ "Aelar e Zeth hanno combattuto contro il Gzemnid's Eye"
- ✅ "Il party ha combattuto contro un occhio gigante di Gzemnid e ha subito danni necrotici"
- ❌ "Aelar ha incontrato Shemeshka e ha giocato a Fortune's Wheel"
- ✅ "Il party ha incontrato Shemeshka al tavolo da gioco di Fortune's Wheel"

### Step 3 — Verifica esistenza del file

Per ogni luogo estratto, verifica se esiste un file corrispondente in `campagna/luoghi-visitati/`:

**Naming convention**: `NN-nome-luogo-slug.md`
- Esempio: `01-sigil-fortunes-wheel.md`, `02-automata-il-grande-ingranaggio.md`, `03-la-mortuary.md`

Dove `NN` è il numero sequenziale.

- **Se NUOVO**: Procedi a Step 4A (Crea nuovo file luogo)
- **Se ESISTENTE**: Procedi a Step 4B (Aggiorna evento nel file)

### Step 4A — Crea nuovo file luogo

Se il luogo è nuovo, crea un nuovo file markdown in `campagna/luoghi-visitati/`:

**Template**:
```markdown
# Nome del Luogo

**Piano/Gate-town**: Nome, Area
**Sessioni Visitate**: SX
**Descrizione**: Descrizione breve (2-3 righe) senza nomi PG specifici.

## PNG Incontrati

- PNG 1 (brevissima descrizione)
- PNG 2

## Eventi Importanti

- [SX] Il party ha [azione generica]

## Note Aggiuntive

Note storiche, referenze, o contesto.
```

**Esempio**:
```markdown
# Fortune's Wheel

**Piano/Gate-town**: Sigil, Lady's Ward
**Sessioni Visitate**: S3
**Descrizione**: Il casinò planare di Shemeshka the Marauder. Sale da gioco affollate, aria di lusso sospetto.

## PNG Incontrati

- Shemeshka the Marauder (proprietaria, cordiale ma inquietante)
- Colcook (concierge dei Platinum Rooms)

## Eventi Importanti

- [S3] Il party accetta l'incarico di Shemeshka: recuperare R04M

## Note Aggiuntive

Luogo cardine del capitolo 3 e 14. *Fonte: ToFW Cap. 3, 14*.
```

**Salva come**: `campagna/luoghi-visitati/NN-nome-slug.md` (sostituisci NN con il numero sequenziale)

### Step 4B — Aggiorna evento luogo esistente

Se il luogo esiste già, aggiungi la nuova riga dell'evento nella sezione **Eventi Importanti**:

1. Apri `campagna/luoghi-visitati/NN-nome-slug.md`
2. Vai a `## Eventi Importanti`
3. Aggiungi una nuova linea:
   ```markdown
   - [SX] Il party ha [azione generica]
   ```

**Esempio di aggiornamento (S3 → S14)**:
```markdown
## Eventi Importanti

- [S3] Il party accetta l'incarico di Shemeshka: recuperare R04M
- [S14] Il party scopre le stanze segrete di Shemeshka e il suo tradimento
```

Aggiorna anche la riga `**Sessioni Visitate**` per includere la nuova sessione:
```markdown
**Sessioni Visitate**: S3, S14
```

### Step 5 — Valida Markdown

Assicurati che il markdown sia sintatticamente corretto:
- Titoli H1 (#), H2 (##), H3 (###) ben formattati
- Liste con `-` e spazi
- Nessun carattere speciale non-escapato

### Step 6 — Esegui il build

Compila il compendio aggiornato:

```bash
cd {repo_root}
npm run build
```

L'output dovrebbe contenere una riga come:
```
✓ [hash]  "Luoghi Visitati"  (NN pagine)
```

Dove `NN` è il numero totale di file .md in `campagna/luoghi-visitati/`.

### Step 7 — Verifica JSON compilato

Il build genera file JSON in `src/campagna/`. Verifica che il JournalEntry "Luoghi Visitati" contenga tutte le pagine:

```bash
# Visualizza il numero di pagine generate
Get-Content src/campagna/[hash].json | Select-String '"name"' | Measure-Object
```

### Step 8 — Passa all'Agente 8

Il compendio è aggiornato e compilato. Passa il controllo a `08-context-updater.agent.md` per aggiornare i file di contorno (party, PNG, missioni, rapporti) prima del commit.

---

## Checklist Finale

Prima di cedere il controllo all'Agente 8:

- [ ] Tutti i luoghi visitati in dm-notes-sessione-NN.md sono stati catturati?
- [ ] Ogni nuovo luogo è stato aggiunto con struttura corretta?
- [ ] Ogni luogo esistente ha un nuovo evento registrato?
- [ ] Format eventi è generico ("Il party") senza nomi PG?
- [ ] JSON è valido (no syntax error)?
- [ ] Build terminato con successo (Pack campagna ✅)?
- [ ] Sessioni Visitate aggiornate (SX aggiunta)?

---

## Note Speciali

### Quando aggiungere, quando NO

**AGGIUNGI il luogo SE:**
- Il party ha fisicamente visitato il luogo (es: entra in edificio, combatte, interagisce)
- È un luogo citato con nome esplicito nelle FASI

**NON AGGIUNGERE SE:**
- È una semplice menzione passante (es: "attraversate le strade di Automata" senza fermarsi)
- È un luogo visto solo da lontano senza interazione
- È già tracciato ma il party non c'è andato durante la sessione

### Coerenza con il filo narrativo interno

Se un evento del Filo A o Filo B (`campagna/filo-narrativo-interno.md`) accade in un luogo, registralo nel compendio in forma generica, senza spiegare esplicitamente il filo:
- ✅ "[S6] Il party nota un'ombra fuori posto in una delle stanze di Curst"
- ✅ "[S7] Un messaggero mascherato consegna un gettone di Fortune's Wheel al party a Excelsior"

Non esitare ad aggregare info multi-fonte per evento più ricco di contesto.
