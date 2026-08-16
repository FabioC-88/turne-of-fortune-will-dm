# Procedimento: Integrazione Mappa Luoghi in Foundry VTT

Questa guida spiega come creare mappe interattive in Foundry VTT per le location della campagna
**Turn of Fortune's Wheel**, con pin che linkano direttamente ai **Luoghi Visitati** del compendio.

---

## Obiettivo

Creare Scene (mappe) delle location principali della campagna con pin posizionati sui punti chiave.
Ogni pin è un Journal Note che collega a una pagina specifica del compendio "Luoghi Visitati".

**Location principali della campagna** (una Scene per luogo cardine, quando raggiunto):
la Mortuary e Fortune's Wheel a Sigil (Cap. 1-3, 14 — base ricorrente), il castello ambulante
Iedcaru nell'Outlands (Cap. 4), i sette gate-town — Automata, Curst, Excelsior, Faunel, Glorium,
Rigus, Sylvania (Cap. 5-11), l'Outlands aperto (Cap. 12), Dendradis e la Spire (Cap. 13), i
Platinum Rooms e la House of Liars (Cap. 14), Tyrant's Spiral nel regno di Gzemnid (Cap. 15).

---

## Prerequisiti

- Foundry VTT con modulo `turne-of-fortune-will-dm` attivato nel mondo
- Immagini delle mappe (dalle appendici del libro, se disponibili per la location)
- Compendio "Luoghi Visitati" compilato (generato da `npm run build`)

---

## Step 1: Preparare le Mappe

### Opzione A — Mappe Ufficiali (Consigliato)

Usa le mappe incluse nel libro/modulo per la location del capitolo in preparazione (es. Map 14.1
Platinum Rooms, Map 15.1 Tyrant's Spiral). Preferisci sempre la "Player Version" (senza annotazioni
DM) per le Scene visibili ai giocatori.

### Opzione B — Mappe Alternative

Se non hai le mappe ufficiali per una location:
- **D&D Beyond / Cartography Exchange / Reddit r/dndmaps:** cerca mappe fan per Planescape/Sigil/gate-town
- **Homebrew:** crea mappe custom con Inkarnate o strumenti simili — utile in particolare per i
  gate-town minori o per varianti dell'ordine di visita scelto dal party

---

## Step 2: Creare le Scene in Foundry

1. Apri il tuo mondo Foundry con il modulo attivato
2. Vai in **Scenes** → **Create Scene**
3. Configura:
   - **Name:** nome della location (es. `Sigil — Fortune's Wheel`, `Automata — Il Grande Ingranaggio`)
   - **Background:** carica l'immagine mappa
   - **Grid Type:** valuta caso per caso — molte location planari (Platinum Rooms, Tyrant's Spiral) non usano griglia standard
   - **Visibility:** decidi se visibile ai giocatori subito o solo quando raggiungono la location

---

## Step 3: Aggiungere Note/Pin

1. Nella Scene, attiva il layer **Journal Notes** (icona libro)
2. Clicca **Create Note** e posiziona il pin sulla mappa
3. Per ogni pin, configura:
   - **Journal Entry:** collega alla entry corrispondente nel compendio "Luoghi Visitati"
   - **Icon:** usa un'icona appropriata (portale per gate/connessioni planari, dado/carte per Fortune's Wheel, ingranaggio per Automata, ecc.)
   - **Label:** nome del luogo in italiano

Compila la tabella dei pin per ogni location man mano che viene giocata, in questo formato:

| Location | Tipo | Entry Compendio |
|----------|------|-----------------|
| — | — | campagna/luoghi-visitati/nome-luogo.md |

---

## Step 4: Collegare al Compendio

Ogni file in `campagna/luoghi-visitati/` viene compilato nel pack `campagna` del modulo tramite `npm run build`.

Per aggiungere un luogo al compendio:
1. Crea il file `campagna/luoghi-visitati/nome-luogo.md` con il formato standard
2. Esegui `npm run build` per ricompilare i packs
3. In Foundry: **Compendium** → cerca il pack "Note Campagna" → importa nel mondo

---

## Step 5: Organizzare le Scene per Capitolo

Crea Scene separate per ogni area principale visitata. Struttura consigliata (da popolare man mano
che i capitoli vengono giocati, nell'ordine di visita scelto dal DM per la Parte 2):

```
Scene: Multiverso — Poster Map Sigil/Outlands (se disponibile nel libro)
Scene: Sigil — la Mortuary (Cap. 1)
Scene: Sigil — Fortune's Wheel (Cap. 3, 14 — base ricorrente)
Scene: Iedcaru — il castello ambulante (Cap. 4)
Scene: [gate-town del capitolo in corso — Automata/Curst/Excelsior/Faunel/Glorium/Rigus/Sylvania]
Scene: la Spire — Dendradis (Cap. 13)
Scene: Platinum Rooms / House of Liars (Cap. 14)
Scene: Tyrant's Spiral (Cap. 15)
```

---

## Note Aggiuntive

- Preferisci sempre le versioni player-safe delle mappe ufficiali (senza annotazioni DM)
- I gate-town della Parte 2 possono essere giocati in ordine diverso da quello del libro — verifica
  l'ordine scelto in `campagna/contesto.md` prima di preparare le Scene in anticipo
- Alcune location planari (Platinum Rooms, Tyrant's Spiral) hanno geometrie non euclidee: il DM
  può scegliere di non usare griglia o di annotare esplicitamente le eccezioni nella Scene
- La cartella `campagna/luoghi-visitati/` non esiste ancora in questo repo: verrà creata dall'Agente 7
  (`07-location-updater.agent.md`) dopo la prima sessione giocata

---

> Aggiorna questo file quando aggiungi nuove Scene o cambi la struttura del compendio.
