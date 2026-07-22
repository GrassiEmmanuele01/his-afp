# Tunnel TCP per il Database (UF14 Task 4)

## Contesto

Il team di Data Analysis ha bisogno di collegare strumenti come DBeaver o
TablePlus al database per generare report. Dalla Task 1, però, la porta
5432 del database non è più esposta all'host per motivi di sicurezza - un
requisito che non va indebolito solo per comodità di un team interno.

## Soluzione: il Gateway come tunnel

Anziché riaprire la porta del database (violando il vincolo della Task 1),
il Gateway stesso fa da "ponte" TCP: chi si connette a
`<host-gateway>:5432` viene inoltrato internamente a `db:5432`, sulla rete
protetta `backend-net`. Il database resta privo di qualunque mappatura di
porta verso l'host; l'unico punto di ingresso continua a essere il Gateway,
come richiesto fin dalla Task 1.

## Perché serve il modulo `stream` di NGINX

NGINX, nella sua configurazione di base (`http{}`), sa instradare solo
traffico HTTP: interpreta richieste, header, metodi. PostgreSQL però parla
un proprio protocollo binario su TCP, non HTTP - non ha "path" né "host
header" da instradare. Il modulo **`stream`** di NGINX opera un livello più
in basso (livello di trasporto, TCP/UDP): si limita a inoltrare byte grezzi
da un socket a un altro, senza interpretarli. È l'unico strumento adatto per
fare da tunnel verso un servizio non-HTTP.

Il blocco `stream{}` **non può stare dentro `http{}`**: è una sezione
gerarchicamente allo stesso livello, dichiarata nel file di configurazione
principale (`nginx.conf`), non nei file inclusi in `conf.d/` (che sono
pensati solo per essere inclusi dentro `http{}`). Per questo motivo è
servito montare un `nginx.conf` personalizzato, invece di limitarci - come
nelle task precedenti - a modificare solo `default.conf`.

```nginx
stream {
    server {
        listen 5432;
        proxy_pass db:5432;
    }
}
```

## Modifiche tecniche applicate

1. Nuovo file `gateway/nginx.conf`: replica la configurazione di base di
   NGINX (`events{}`, `http{}` con l'`include` verso `conf.d/*.conf`
   invariato) e aggiunge il blocco `stream{}` sopra descritto.
2. `docker-compose.yml`: il `gateway` monta ora due file distinti -
   `gateway/default.conf` su `/etc/nginx/conf.d/default.conf` (routing HTTP,
   invariato dalle task precedenti) e `gateway/nginx.conf` su
   `/etc/nginx/nginx.conf` (il file principale, con il tunnel).
3. Aggiunta la porta `"5432:5432"` ai `ports:` del `gateway` - resta
   l'unico servizio con porte esposte sull'host.
4. Il servizio `db` **non è stato modificato**: nessun `ports:` è stato
   aggiunto, come richiesto esplicitamente dal vincolo di sicurezza della
   task.

## Vantaggio pratico: un solo interruttore

Come richiesto dal cliente, chiudere l'accesso ai dati in futuro richiede di
toccare solo il Gateway - basta rimuovere il blocco `stream{}` (o la riga
`"5432:5432"` dai `ports:`) e ricaricare/riavviare **solo** il Gateway,
senza mai toccare il container del database.

## Guida ai test eseguiti

### Test 1 - Il tunnel raggiunge davvero il database

```bash
docker run --rm -e PGPASSWORD=sio_password postgres:15-alpine \
  psql -h host.docker.internal -p 5432 -U sio_user -d sio_db \
  -c "SELECT count(*) FROM sio.users;"
```

**Risultato atteso e ottenuto:** la query viene eseguita con successo e
restituisce il conteggio reale delle righe nella tabella `sio.users` - a
conferma che il traffico attraversa realmente il Gateway fino al database.

### Test 2 - Il database resta privo di porte esposte

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

**Risultato atteso e ottenuto:** `sio-postgres` mostra solo `5432/tcp`
(nessuna mappatura `0.0.0.0:`); solo `sio-gateway` espone porte verso
l'host (`80`, `8080`, `8999`, `5432`).

### Test 3 - Nessuna regressione sulle API esistenti

```bash
curl http://localhost/api/users
curl http://localhost/api/health
```

**Risultato atteso e ottenuto:** entrambe le chiamate rispondono
normalmente, a conferma che l'aggiunta del tunnel TCP non ha impattato il
routing HTTP già esistente sullo stesso Gateway.

## Nota per chi ripete questi test

Se sulla macchina host è già in esecuzione un altro servizio PostgreSQL
(nativo o un vecchio container) in ascolto sulla porta 5432, l'avvio del
Gateway fallirà con un errore di tipo "port is already allocated": va
liberata la porta 5432 sull'host prima di eseguire `docker-compose up`.