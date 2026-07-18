# Zero-Downtime Backend & Database Migration (UF14 Task 3)

## Contesto

Nella Task 2 è stato risolto il problema dell'aggiornamento del
**backend** senza interrompere il servizio, grazie alla strategia
Blue/Green. Rimane però un aspetto più delicato: come gestire un
aggiornamento del **database** quando la nuova versione
dell'applicazione (Green) richiede uno schema diverso, mentre la vecchia
(Blue) è ancora online e continua a servire richieste.

Se la modifica viene eseguita in modo distruttivo, ad esempio
rinominando o eliminando una colonna, la versione Blue smette
immediatamente di funzionare perché continua ad aspettarsi il vecchio
schema. In questo modo si perderebbe il vantaggio dello zero downtime.

## La soluzione: migrazioni additive

Per evitare questo problema è stata adottata la strategia delle
**migrazioni additive**. L'idea è semplice: lo schema del database viene
solo esteso, senza rimuovere o modificare ciò che il codice già in
produzione utilizza.

In pratica si possono aggiungere nuove colonne o nuove tabelle, evitando
operazioni come: - eliminazione di colonne; - rinomina di campi già
utilizzati; - introduzione di vincoli `NOT NULL` senza un valore di
default.

Questo permette alle due versioni del backend di convivere sullo stesso
database durante il rilascio.

### Esempio

``` sql
ALTER TABLE sio.users
    ADD COLUMN IF NOT EXISTS note TEXT NULL;
```

La nuova colonna `note` è stata definita come **nullable**, quindi tutti
i record già presenti rimangono validi.

Inoltre il backend Blue continua a funzionare senza modifiche perché le
sue query selezionano esplicitamente solo i campi necessari (`id`,
`username`, `role`, `is_active`, ecc.) e non utilizzano `SELECT *`. Di
conseguenza la presenza della nuova colonna non altera il comportamento
del codice esistente.

## Test effettuati

Per verificare il funzionamento della soluzione è stata eseguita la
seguente procedura:

1.  Applicazione della migrazione sul database condiviso mentre Blue e
    Green erano entrambi attivi.
2.  Aggiornamento del file `staff.js` per gestire il nuovo campo `note`.
3.  Ricompilazione del solo container `backend-green` tramite:

``` bash
docker-compose up -d --build backend-green
```

4.  Creazione dell'utente `test.green` attraverso Green, valorizzando il
    campo `note`.
5.  Reindirizzamento del traffico verso Blue ed esecuzione di
    `GET /api/users`.

Il risultato è stato quello atteso: Blue ha continuato a rispondere
correttamente senza errori. L'utente creato tramite Green risultava
presente anche nelle risposte di Blue, semplicemente senza il campo
`note`, che quella versione dell'applicazione non conosce.

In questo modo è stato dimostrato che il database può essere aggiornato
senza interrompere il servizio.

## Domande tecniche

### Gateway Routing

Il meccanismo di instradamento rimane identico a quello della Task 2.

Nel file `gateway/default.conf` è sufficiente modificare il backend di
destinazione della direttiva `proxy_pass`, passando da Blue a Green (o
viceversa), e ricaricare NGINX:

``` nginx
location /api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://sio-backend-blue:3000;
}
```

Lo switch viene applicato con:

``` bash
docker exec sio-gateway nginx -s reload
```

Un possibile miglioramento futuro potrebbe essere l'utilizzo di un
blocco `upstream` con pesi differenti (ad esempio 90% Blue e 10% Green)
per realizzare un rilascio canary graduale.

### Perché usare migrazioni additive?

Le migrazioni additive consentono di separare l'evoluzione del database
dall'aggiornamento del codice.

Lo schema può essere esteso prima che il nuovo backend venga
distribuito, mentre la versione precedente continua a funzionare senza
modifiche. Al contrario, una modifica distruttiva costringerebbe a
spegnere Blue prima di intervenire sul database, introducendo
inevitabilmente un periodo di downtime.

### Impatto sul frontend

Dal punto di vista dell'utente finale non è necessario ricaricare la
pagina.

Il frontend continua a inviare le richieste allo stesso endpoint
(`/api/...`); è il Gateway che decide quale backend utilizzare. Se le
API rimangono retrocompatibili, il cambio di versione è completamente
trasparente.

Per quanto riguarda l'autenticazione, entrambi i backend condividono lo
stesso valore di `JWT_SECRET`. Questa configurazione permette a un token
generato da Blue di essere validato anche da Green e viceversa, evitando
la disconnessione degli utenti durante lo switch.

Nel progetto attuale l'autenticazione è ancora disabilitata
(`AUTH_ENABLED=false`), ma la configurazione è già pronta per un futuro
utilizzo.

### Docker Orchestration

I container `backend-blue` e `backend-green` non espongono porte verso
l'host.

Entrambi ascoltano internamente sulla porta 3000, ma sono raggiungibili
tramite hostname Docker differenti (`sio-backend-blue` e
`sio-backend-green`). Grazie alla rete interna di Docker Compose non
esistono conflitti di porta e i due backend possono condividere lo
stesso database.

## Guida ai test eseguiti

| Test | Comando | Risultato atteso |
|---|---|---|
| Migrazione additiva applicata senza downtime | `docker exec -i sio-postgres psql -U sio_user -d sio_db < db/migrations/002_add_note_to_users.sql` mentre Blue/Green sono attivi | `ALTER TABLE`, nessun errore, `/api/users` continua a rispondere |
| Migrazione idempotente | Rilancio dello stesso comando | `NOTICE: column "note" ... already exists, skipping`, nessun errore |
| Solo Green riceve il nuovo codice | `docker-compose up -d --build backend-green` (senza toccare `backend-blue`) | Solo il container Green viene ricostruito |
| Green usa la nuova colonna | `POST /api/users` con `note` mentre il Gateway punta a Green | Risposta include `"note": "..."` |
| Blue rimane compatibile dopo lo switch inverso | `GET /api/users` mentre il Gateway punta di nuovo a Blue | `200 OK`, il record creato da Green è presente ma senza il campo `note` |