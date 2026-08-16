---
name: prep-sessione
description: >
  Orchestratore della pipeline completa di preparazione sessione per la campagna D&D Turn of
  Fortune's Wheel. Usa questa skill ogni volta che il DM vuole preparare una nuova sessione di
  gioco, anche se scrive semplicemente "/prep-sessione" o "prepara la sessione" o "prossima
  sessione". Esegue in sequenza gli agenti 1→2→3→4→2→6 e opzionalmente 5 (chapter-png-briefer a
  cambio capitolo). Produce il file dm-notes-sessione-NN.md pronto per il tavolo. FUNZIONA ANCHE
  SE IL PARTY NON È ANCORA DEFINITO (campagna/party.md = TBD): non bloccarti e non chiedere
  conferma per preparare sessioni in anticipo, il DM lo ha già autorizzato esplicitamente — in
  quel caso lo Step 3 si autodisattiva e produce comunque una sessione completa ma generica.
---

# Pipeline Preparazione Sessione — /prep-sessione

Sei l'orchestratore della pipeline DM per Turn of Fortune's Wheel. Il tuo compito è guidare la
preparazione di una sessione completa eseguendo in sequenza tutti gli agenti definiti in `ai/agents/`.

**Prima di iniziare:** se il numero della sessione target non è stato specificato, chiedi al DM.
Il numero si trova contando i file in `campagna/sessioni/dm-notes-sessione-*.md` + 1.

**Se `campagna/party.md` è ancora `TBD`:** esegui comunque l'intera pipeline. Non è un blocco, è
un caso normale — il DM prepara sessioni in anticipo prima di avere il party al tavolo. Prosegui
fino in fondo; solo lo Step 3 (e, di riflesso, parte dello Step 6b) produce meno contenuto perché
non ci sono PG a cui agganciare hook personali. Non fermarti per chiedere conferma e non inventare
un party fittizio per "sbloccare" la pipeline.

---

## Pipeline (esegui nell'ordine)

Tra uno step e il successivo, mostra un breve messaggio di avanzamento:
`✅ Agente N completato → avvio Agente N+1...`

### Step 1 — Estrazione chunk narrativo
Leggi ed esegui le istruzioni di `ai/agents/01-session-extractor.agent.md`.

Input: ultimo `dm-notes-sessione-XX.md` (per il marker di avanzamento) + `fonti/campagna/`
Output: documento grezzo con chunk EN, testi boxed marcati `[BOXED TEXT — ID: BT-XX]`, indice encounter.

### Step 2 — Traduzione e stile italiano
Leggi ed esegui le istruzioni di `ai/agents/02-session-translator.agent.md`.

Input: output Step 1
Output: draft IT con testi boxed espansi. Aggiunte atmosferiche in blockquote separati `*[aggiunta atmosferica]*`.
Tutte le informazioni dell'originale devono essere presenti — nessun dettaglio può essere omesso.

### Step 3 — Integrazione personaggi giocanti *(condizionale)*
Leggi ed esegui le istruzioni di `ai/agents/03-session-pc-integrator.agent.md`.

Input: draft IT da Step 2
File da leggere: `campagna/party.md`, `campagna/png-incontrati.md`, `campagna/rapporti.md`,
`campagna/fazioni.md`, `campagna/contesto.md`, `campagna/filo-narrativo-interno.md`, `fonti/personaggi/*.md`
Output: draft con hook PG, scene spotlight opzionali, note DM riservate, atteggiamenti PNG aggiornati.

**Se `campagna/party.md` è TBD:** l'agente stesso rileva la condizione (suo Step 0), salta il
resto delle sue istruzioni e restituisce il draft invariato con una nota `⏭ Agente 3 saltato`.
Continua comunque con lo Step 4.

### Step 4 — Integrazione missioni/digressioni
Leggi ed esegui le istruzioni di `ai/agents/04-session-missions-integrator.agent.md`.

Input: draft da Step 3
File da leggere: `campagna/missioni-secondarie.md`, `campagna/fazioni.md`.
Output: draft con eventuali hook integrati nei momenti di respiro narrativo — salta automaticamente
se non ci sono missioni/digressioni attive (caso standard di questa campagna).

### Step 5 — Uniformazione stile (seconda invocazione Agente 2)
Leggi ed esegui di nuovo le istruzioni di `ai/agents/02-session-translator.agent.md`.

Questa volta il tuo ruolo è solo uniformare lo stile italiano sulle parti aggiunte dagli Agenti 3 e 4.
Non stravolgere le integrazioni — solo correggi calchi linguistici e incongruenze di registro.

### Step 6 — Revisione finale
Leggi ed esegui le istruzioni di `ai/agents/06-session-reviewer.agent.md`.

Input: draft quasi-finale da Step 5 + ultimo `dm-notes-sessione-XX.md` giocato
Applica direttamente le correzioni (non solo segnalarle). Genera Revision Log.
Output: `dm-notes-sessione-NN.md` finalizzato con sezione `🔍 REVISION LOG — Agente 6`.

### Step 6.5 — Aggiornamento PNG nei file PG (condizionale)
Leggi `campagna/contesto.md` e controlla il campo `Capitolo corrente`.
Controlla il capitolo della sessione appena preparata.

**Solo se il capitolo della sessione > Capitolo corrente:** esegui le istruzioni di
`ai/agents/05-chapter-png-briefer.agent.md`.
Output: file `campagna/png-per-capitolo/capitolo-NN/NomePG.md` creati per ogni PG con almeno 1 PNG noto.
Aggiorna `campagna/contesto.md` con il nuovo capitolo corrente.

Se il capitolo non è cambiato: stampa `⏭ Step 6.5 saltato (nessuna transizione di capitolo)`.

---

## Riepilogo finale

Al termine di tutta la pipeline, stampa:

```
✅ Pipeline completata — Sessione NN

File prodotti:
- campagna/sessioni/dm-notes-sessione-NN.md
[- campagna/png-per-capitolo/capitolo-NN/NomePG.md  ← file PNG per capitolo, solo se Step 6.5 attivo]

Prossimi step manuali:
1. Leggi e approva dm-notes-sessione-NN.md
2. /aggiorna-locations NN  (dopo aver giocato la sessione)
3. /git-release  (per pubblicare l'aggiornamento su Foundry)
```
