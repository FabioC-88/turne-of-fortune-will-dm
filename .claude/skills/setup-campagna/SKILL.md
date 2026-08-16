---
name: setup-campagna
description: >
  Bootstrap di una nuova campagna D&D. Legge i materiali grezzi in fonti/ e genera tutti i file
  strutturati necessari alla pipeline DM: contesto, party, fazioni, missioni, personaggi.
  Usa questa skill quando il DM vuole iniziare una nuova campagna da zero: "/setup-campagna",
  "inizia nuova campagna", "crea i file strutturati dalle fonti". Da eseguire una sola volta per
  campagna dopo aver caricato i materiali grezzi in fonti/. NON usare per aggiornare una campagna
  già avviata — per quello usa /aggiorna-sessione.
---

# Bootstrap Nuova Campagna — /setup-campagna

Sei l'agente di setup per una nuova campagna D&D 5e. Il tuo compito è leggere i materiali grezzi
e generare tutti i file strutturati che gli altri agenti useranno durante tutta la campagna.

**Regola fondamentale:** non inventare informazioni non presenti nelle fonti. Usa `[TODO: da compilare]`
per i gap e vai avanti — è meglio un file incompleto onesto che uno inventato.

**Specifico di questo progetto:** `campagna/contesto.md` è già pre-compilato dalla lettura del
libro (villain, tabella capitoli, meccanica *Glitch Characters*, nota "Potere in Prestito", nota
sul collegamento con il Culto di Vecna). Non riscriverlo da zero — integra solo le sezioni ancora
marcate `TBD`/`[TODO]` (party, PG, incarnazioni). Segui `ai/agents/00-campaign-setup.agent.md` per
i dettagli.

---

## Step 1 — Verifica materiali disponibili

Controlla cosa è presente in `fonti/`:

```
fonti/campagna/     ← deve contenere il libro/modulo principale (Turn of Fortune's Wheel.md)
                       e filo-narrativo-multiverso.md
fonti/missioni/     ← opzionale: testi grezzi delle missioni secondarie
fonti/personaggi/   ← file BG dei PG (es. NomeGiocatore.md)
fonti/lore/         ← opzionale: guide ambientazione, gazetteer
```

Se una cartella essenziale è vuota o mancante, segnalalo prima di procedere.

---

## Step 2 — Intervista al DM

Fai **tutte queste domande in un unico messaggio**, poi aspetta le risposte prima di generare i file:

1. **Party:** quanti giocatori fissi? Ospiti occasionali? Per ogni giocatore: nome giocatore, nome PG, razza/classe.
2. **Incarnazioni:** i giocatori hanno già scelto le 3 incarnazioni di ogni PG (meccanica *Glitch Characters*) o preferiscono deciderle in gioco alla prima morte?
3. **Nexus Feature:** per ogni PG, qual è l'oggetto/tratto condiviso tra le incarnazioni (vedi tabella nell'introduzione del libro)?
4. **Durata media sessioni:** quanto durano di solito?
5. **Livello di partenza:** confermare 3° livello (standard del libro) o diverso.
6. **Ordine gate-town:** vuoi seguire l'ordine del libro per la Parte 2 (Automata → Curst → Excelsior → Faunel → Glorium → Rigus → Sylvania) o un ordine diverso?

---

## Step 3 — Genera/aggiorna i file strutturati

Dopo le risposte del DM, esegui le istruzioni complete di `ai/agents/00-campaign-setup.agent.md`
per generare/aggiornare nell'ordine:

1. `campagna/contesto.md` — integra solo le sezioni party/PG ancora TBD, non toccare il resto
2. `campagna/party.md` (stato PG: livello, XP, incarnazioni, gancio attivo)
3. `campagna/png-incontrati.md` (template vuoto con header)
4. `campagna/rapporti.md` (file vuoto con header)
5. `personaggi/NomePG.md` per ogni PG in `fonti/personaggi/`

`campagna/fazioni.md` e `campagna/missioni-secondarie.md` esistono già come stub (nessuna fazione
arruolabile, campagna semi-lineare) — modificali solo se il DM introduce contenuti custom.

---

## Riepilogo finale

Stampa al termine:

```
✅ File generati/aggiornati:
- campagna/contesto.md (sezioni party integrate)
- campagna/party.md
- campagna/png-incontrati.md
- campagna/rapporti.md
- personaggi/NomePG.md         (N file totali)

⚠️ TODO da completare manualmente:
[lista campi [TODO] aperti]

Prossimo passo: /prep-sessione per preparare la prima sessione.
```
