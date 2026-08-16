AI files: uso e organizzazione
===============================

Scopo
------
Questo file descrive i file "AI / agent / prompt" presenti nel repository, come usarli e come è organizzato il sistema.

Struttura file AI
------------------
Tutti gli agenti e le istruzioni si trovano sotto `ai/agents/`:

```
ai/agents/
  AGENTS.md                        ← Documentazione framework agenti (pipeline, mappa cartelle)
  instructions.md                  ← Slash commands per VS Code Copilot Chat
  00-campaign-setup.agent.md       ← Bootstrap nuova campagna da fonti grezze
  00-recap-updater.agent.md        ← Aggiorna note sessione dopo il gioco
  01-session-extractor.agent.md    ← Estrae chunk narrativo da fonti/campagna/
  02-session-translator.agent.md   ← Traduce e adatta in italiano
  03-session-pc-integrator.agent.md ← Integra hook PG e atteggiamenti PNG
  04-session-missions-integrator.agent.md ← Integra hook missioni secondarie (non usato: nessuna missione secondaria in questa campagna)
  05-chapter-png-briefer.agent.md  ← Genera i briefing PNG per capitolo
  06-session-reviewer.agent.md     ← QC finale e validazione
  07-location-updater.agent.md     ← Aggiorna il compendio Luoghi Visitati
  08-context-updater.agent.md      ← Aggiorna party/PNG/missioni/rapporti dopo la sessione
  git-procedures.agent.md          ← Procedure Git/release
```

Struttura campagna
-------------------
I file di contenuto della campagna attiva sono in:

```
campagna/
  contesto.md               ← Party, PNG, villain, gruppi, tabella capitoli, meccaniche speciali
  party.md                  ← Livello, XP, stato attuale PG
  fazioni.md                ← Gruppi rilevanti (nessuna fazione arruolabile in questa campagna)
  missioni-secondarie.md    ← Nota: campagna semi-lineare, cap. 12 = eventi opzionali
  png-incontrati.md         ← Registro PNG incontrati con attitudini
  rapporti.md                ← Note qualitative PG-PNG
  filo-narrativo-interno.md ← Fili ricorrenti tra i 7 gate-town (cap. 5-11)
  sessioni/                 ← Note per sessione (dm-notes-sessione-NN.md)
  png-per-capitolo/         ← Briefing PNG per capitolo, generato progressivamente

fonti/
  campagna/                 ← Fonte narrativa principale: Turn of Fortune's Wheel.md
                               + filo-narrativo-multiverso.md (filo del Culto di Vecna)
```

Uso con VS Code Copilot
------------------------
Gli agenti sono file `.agent.md` usabili in VS Code Copilot Chat in modalità agent.
Le istruzioni in `instructions.md` definiscono gli slash commands disponibili:

- `/setup-campagna`   — Bootstrap party/PG (contesto.md è già pre-compilato dalla lettura del libro)
- `/prep-sessione`    — Prepara la sessione successiva (pipeline agenti)
- `/aggiorna-sessione` — Aggiorna note sessione dopo il gioco
- `/aggiorna-locations` — Aggiorna il compendio Luoghi Visitati
- `/git-release`      — Pubblica una nuova release del modulo Foundry VTT

Avviare la campagna
---------------------------
1. Il materiale grezzo è già in `fonti/campagna/Turn of Fortune's Wheel.md` e
   `fonti/campagna/filo-narrativo-multiverso.md`.
2. `campagna/contesto.md` è già pre-compilato con villain, tabella capitoli e meccaniche
   speciali (*Glitch Characters*, "Potere in Prestito").
3. Usa `/setup-campagna` in Claude Code o Copilot Chat → invoca `00-campaign-setup.agent.md`
   per l'intervista sul party (giocatori, PG, incarnazioni) e generare i file mancanti.

Note specifiche di questa campagna
------------------------------------
- **Nessuna missione secondaria**: la trama segue il recupero di R04M e la riparazione del
  *Mosaic Mimir* attraverso i sette gate-town. `04-session-missions-integrator.agent.md` leggerà
  `campagna/missioni-secondarie.md` e si disattiverà automaticamente.
- **Nessuna fazione arruolabile**: `campagna/fazioni.md` traccia solo gruppi rilevanti (Heralds
  of Dust, Harmonium, Fortune's Wheel, i modroni) come riferimento narrativo.
- **Glitch Characters**: ogni PG ha 3 incarnazioni. Vedi `campagna/contesto.md` e l'introduzione
  del libro per le regole complete.
- **"Potere in Prestito"**: il balzo a 17° livello dei cap. 14-15 è homebrew temporaneo — i PG
  tornano a 10° a fine campagna. Vedi `campagna/contesto.md`.
- **Filo del Culto di Vecna**: collega questa campagna alle altre del DM. Vedi
  `fonti/campagna/filo-narrativo-multiverso.md` — va inserito solo nei capitoli 1-3.
