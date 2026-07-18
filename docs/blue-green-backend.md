# Blue/Green Deployment del Backend (UF14 Task 2)

## Contesto

Prima di questa modifica, il backend era un singolo container: ogni
aggiornamento richiedeva fermarlo e ricrearlo, causando un'interruzione delle
API durante il rilascio — inaccettabile in un pronto soccorso, dove gli
operatori devono poter salvare cartelle cliniche in ogni momento.

## Soluzione implementata

Il backend è stato duplicato in due istanze identiche, entrambe collegate
allo stesso database:

- **`sio-backend-blue`** (`INSTANCE_VERSION=blue`) — versione stabile,
  attiva di default.
- **`sio-backend-green`** (`INSTANCE_VERSION=green`) — nuova versione,
  pronta a subentrare.

Il Gateway (NGINX) decide quale istanza riceve il traffico tramite la
direttiva `proxy_pass` nei blocchi `location /api/` di `gateway/default.conf`.
Per identificare quale istanza sta rispondendo in un dato momento, l'endpoint
`/health` del backend riporta un campo `version` letto dalla variabile
d'ambiente `INSTANCE_VERSION`.

## Procedura di switch (Blue → Green)

1. Modificare le tre occorrenze di `proxy_pass http://sio-backend-blue:3000;`
   in `gateway/default.conf`, sostituendo `blue` con `green`.
2. Ricaricare la configurazione di NGINX **senza riavviare il container**:
   ```bash
   docker exec sio-gateway nginx -s reload
   ```
3. Verificare lo switch:
   ```bash
   curl http://localhost/api/health
   ```
   Il campo `version` deve riportare `"green"`.

Il passaggio è istantaneo e non causa alcuna interruzione delle API: le
richieste in corso durante il reload vengono comunque gestite da NGINX prima
che i worker vengano ricaricati.

## Procedura di rollback (Green → Blue)

Identica alla procedura di switch, ma nella direzione opposta: si
riportano le tre occorrenze a `sio-backend-blue:3000` in
`gateway/default.conf` e si esegue di nuovo:
```bash
docker exec sio-gateway nginx -s reload
```
Anche qui, nessun riavvio di container, nessuna interruzione del servizio.

## Riflessione: cosa succede ai dati se Green scrive e poi si fa rollback a Blue?

**I dati scritti da Green rimangono.** Blue e Green condividono lo stesso
database (`db`) — non hanno uno storage separato. Se durante la finestra in
cui Green era attivo un operatore ha creato un nuovo paziente o modificato
un record, quella scrittura è persistita nel DB comune. Il rollback a Blue
cambia solo *quale codice applicativo* riceve le richieste HTTP: non
annulla né isola in alcun modo le transazioni già eseguite sul database.

Questo ha un'implicazione importante che va oltre la Task 2: un vero
rollback "sicuro" è garantito solo se il codice di Blue è ancora in grado di
leggere/scrivere correttamente lo schema del database così come lo ha
lasciato Green. Se Green avesse introdotto una modifica strutturale al
database (es. una colonna obbligatoria), Blue potrebbe non funzionare più
correttamente dopo il rollback — è esattamente il problema affrontato nella
Task 3 (Zero-Downtime Backend & Database Migration) tramite il concetto di
*migrazioni additive*.

Per questa Task 2, non essendo richieste modifiche allo schema (come
esplicitato dal cliente: *"non mi interessa come gestite i dati
internamente per ora"*), il rollback è sempre sicuro nella pratica.

## Guida ai test eseguiti

| Test | Comando | Risultato atteso |
|---|---|---|
| Blue attivo di default | `curl http://localhost/api/health` | `"version":"blue"` |
| Switch a Green | modifica `default.conf` + `nginx -s reload`, poi `curl http://localhost/api/health` | `"version":"green"` |
| Rollback a Blue | stesso procedimento inverso | `"version":"blue"` |
| Nessun downtime durante lo switch | `curl http://localhost/api/users` eseguito prima, durante e dopo lo switch | Sempre `200 OK`, mai un errore di connessione |