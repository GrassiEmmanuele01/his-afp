# Migrazione Architetturale — Isolamento di Rete (UF14 Task 1)

## Contesto

Il sistema HIS-AFP gestisce dati sanitari sensibili (anagrafica e stato clinico
dei pazienti). Prima di questa migrazione, l'infrastruttura Docker era
configurata con una rete "piatta": tutti i container (frontend di Produzione,
Test, Sviluppo, backend e database) condividevano la stessa rete di default,
senza alcuna segmentazione.

## Architettura precedente

```
┌─────────────────────────────────────────────────────────┐
│                    rete Docker di default                │
│                                                           │
│   fe-prod   fe-test   fe-sio   backend   db (porta 5432  │
│                                            esposta host)  │
└─────────────────────────────────────────────────────────┘
```

**Problema:** qualsiasi container, incluso un frontend eventualmente
compromesso (es. tramite una vulnerabilità XSS/RCE), poteva risolvere via DNS
e raggiungere direttamente il database sulla porta 5432 — sia da dentro
Docker, sia dall'host stesso, dato che la porta era mappata verso l'esterno.
Non esisteva alcuna barriera di rete tra la "zona pubblica" (i portali) e la
"zona sensibile" (dati clinici).

## Architettura attuale

```
┌────────────────────┐        ┌────────────────────┐
│    frontend-net     │        │     backend-net     │
│                     │        │                     │
│  fe-prod  fe-test   │        │   backend    db     │
│      fe-sio         │        │                     │
└──────────┬──────────┘        └──────────┬──────────┘
           │                              │
           └──────────► gateway ◄─────────┘
                    (unico container
                     su entrambe le reti,
                     unico container con
                     porte esposte all'host)
```

Sono state introdotte due reti Docker separate, dichiarate in
`docker-compose.yml`:

- **`frontend-net`**: contiene solo i tre portali (`fe-prod`, `fe-test`,
  `fe-sio`). Non hanno alcuna visibilità sulla rete che ospita i dati.
- **`backend-net`**: contiene `backend` e `db`. È la "zona protetta".
- **`gateway`**: è l'unico servizio collegato a **entrambe** le reti, e media
  ogni comunicazione tra le due zone. È anche l'unico container con porte
  mappate verso l'host (`80`, `8080`, `8999`).

## Perché questa migrazione (e perché era necessaria)

- **Riduzione della superficie d'attacco:** se un frontend viene compromesso,
  l'attaccante si trova su `frontend-net`, dove il database non esiste dal
  punto di vista della risoluzione DNS — non è né raggiungibile né rilevabile.
- **Compliance:** come indicato dal cliente, un'architettura non isolata non
  supererebbe l'audit di sicurezza necessario per l'accreditamento sanitario
  regionale.
- **Difesa in profondità:** anche se il backend restasse vulnerabile, un
  frontend compromesso non potrebbe più usarlo come trampolino diretto verso
  il DB senza passare comunque dal backend stesso (che applica la propria
  logica di business e validazione).

## Modifiche tecniche applicate

1. Aggiunta della sezione `networks:` in `docker-compose.yml` con le due reti
   `frontend-net` e `backend-net`.
2. Assegnazione di `fe-prod`, `fe-test`, `fe-sio` esclusivamente a
   `frontend-net`.
3. Assegnazione di `backend` e `db` esclusivamente a `backend-net`.
4. Il `gateway` è l'unico servizio presente su entrambe le reti.
5. **Hardening:** rimossa la mappatura `ports: "5432:5432"` dal servizio `db`.
   Il database non è più raggiungibile né dall'host né da alcun container al
   di fuori di `backend-net`.

## Guida ai test eseguiti

Tutti i test sono stati eseguiti dopo `docker-compose down` seguito da
`docker-compose up -d --build`, per garantire uno stato pulito.

### Test 1 — Isolamento DNS del database dal frontend di produzione

```bash
docker exec sio-fe-prod getent hosts db; echo "Exit code: $?"
```

**Risultato atteso e ottenuto:** nessun output e `Exit code: 2` — il nome
`db` non viene risolto dal container di produzione. Il database risulta
tecnicamente inesistente per chi si trova in `frontend-net`.

### Test 2 — Porta del database non esposta all'host

```bash
docker ps
```

**Risultato atteso e ottenuto:** il container `sio-postgres` mostra `5432/tcp`
nella colonna `PORTS`, senza alcuna mappatura `0.0.0.0:5432->5432/tcp`.

### Test 3 — Continuità del servizio (nessuna regressione)

```bash
curl http://localhost/api/users
```

**Risultato atteso e ottenuto:** risposta `200 OK` con la lista dello staff,
a conferma che il backend continua a comunicare correttamente con il database
attraverso `backend-net`, nonostante l'isolamento.

### Test 4 — Unico punto di ingresso

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

**Risultato atteso e ottenuto:** solo `sio-gateway` espone porte verso
l'host (`80`, `8080`, `8999`). Tutti gli altri container non hanno porte
mappate sull'host.

## Considerazioni critiche e possibili evoluzioni future

L'architettura attuale risolve il problema richiesto (isolamento dei dati
sanitari) con lo strumento minimo necessario — reti Docker native — che è
proporzionato alla scala del progetto (un singolo host, ambienti
Prod/Test/Sviluppo gestiti come container separati anziché come deployment
paralleli). Detto questo, ci sono limiti da segnalare:

- **Single point of failure sul Gateway:** un solo container NGINX gestisce
  tutto il routing. In un contesto di produzione reale, un
  **orchestratore come Kubernetes** con un **Ingress Controller dedicato
  (es. Traefik)** offrirebbe replica automatica, health check nativi e
  failover del componente di ingresso, cosa che qui non è gestita.
- **Configurazione statica via file `.conf` montati:** ogni cambiamento di
  routing richiede una modifica manuale dei file NGINX e un riavvio. Un
  sistema di **feature flags dinamici** (es. attraverso un servizio di
  configurazione centralizzato) permetterebbe di cambiare instradamento o
  abilitare/disabilitare funzionalità senza toccare file di configurazione o
  riavviare container.
- **Segmentazione a due livelli, non a servizio:** `backend` e `db`
  condividono la stessa rete. Un'architettura ancora più stringente
  isolerebbe anche il backend dal database su reti dedicate 1:1, con regole
  di firewall più granulari (qui non implementato per restare nell'ambito
  della Task 1, che richiedeva esplicitamente questa granularità a due
  livelli).

Per il contesto di un esame/progetto didattico con un singolo host Docker,
ritengo la soluzione attuale corretta e proporzionata; le evoluzioni sopra
elencate avrebbero senso in un contesto di produzione multi-nodo reale.
