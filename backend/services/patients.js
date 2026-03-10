import {pool} from "./dbSession.js";
import {AppError, catchAsync} from "../utils/errorHandler.js";

/**
 * GET /admissions
 * Recupera accessi attivi con JOIN sulle tabelle di lookup.
 */
export const retrieveActiveAdmissionsFn = catchAsync(async (req, res) => {
	const query = `
        SELECT a.id,
               a.braccialetto,
               a.data_ora_ingresso AS "dataOraIngresso",
               a.stato,
               a.note_triage       AS "noteTriage",
               a.patologia_code    AS "patologiaCode",

               -- Oggetto Paziente appiattito o strutturato (qui uso prefissi per chiarezza)
               p.nome,
               p.cognome,
               p.data_nascita      AS "dataNascita",
               p.codice_fiscale    AS "codiceFiscale",
               p.sex,

               -- Dati Patologia
               path.code           AS "patologiaCode",
               path.description    AS "patologiaDescrizione",

               -- Dati Colore
               tc.code             AS "coloreCode",
               tc.hex_value        AS "coloreHex",
               tc.display_name     AS "coloreNome",

               -- Dati Modalità Arrivo
               am.code             AS "modalitaArrivoCode",
               am.description      AS "modalitaArrivoDescrizione"

        FROM admissions a
                 JOIN patients p ON a.patient_id = p.id
                 LEFT JOIN triage_colors tc ON a.codice_colore = tc.code
                 LEFT JOIN pathologies path ON a.patologia_code = path.code
                 LEFT JOIN arrival_modes am ON a.modalita_arrivo_code = am.code
        WHERE a.stato NOT IN ('DIM', 'RIC')
        ORDER BY tc.priority, a.data_ora_ingresso DESC
	`;

	const result = await pool.query(query);

	res.status(200).json({
		status: 'success',
		results: result.rowCount,
		data: result.rows
	});
});

/**
 * GET /admissions/:id
 */
export const retrieveAdmissionByIDFn = catchAsync(async (req, res, next) => {
	const {id} = req.params;
	const query = `
        SELECT a.id,
               a.braccialetto,
               a.data_ora_ingresso AS "dataOraIngresso",
               a.stato,
               a.note_triage       AS "noteTriage",
               p.nome,
               p.cognome,
               p.data_nascita      AS "dataNascita",
               p.codice_fiscale    AS "codiceFiscale",
               p.sex,
               p.indirizzo_via     as "indirizzoVia",
               p.indirizzo_civico  AS "indirizzoCivico",
               p.comune,
               p.provincia,
               path.code           AS "patologiaCode",
               path.description    AS "patologiaDescrizione",
               tc.code             AS "coloreCode",
               tc.hex_value        AS "coloreHex",
               tc.display_name     AS "coloreNome",
               am.code             AS "modalitaArrivoCode",
               am.description      AS "modalitaArrivoDescrizione"
        FROM admissions a
                 JOIN patients p ON a.patient_id = p.id
                 LEFT JOIN triage_colors tc ON a.codice_colore = tc.code
                 LEFT JOIN pathologies path ON a.patologia_code = path.code
                 LEFT JOIN arrival_modes am ON a.modalita_arrivo_code = am.code
        WHERE a.id = $1
	`;

	const result = await pool.query(query, [id]);
	if (result.rows.length === 0) {
		return next(new AppError("Accesso non trovato con questo ID", 404));
	}

	res.status(200).json({
		status: 'success',
		data: result.rows[0]
	});
});

/**
 * POST /admissions
 * Crea un nuovo accesso. Gestisce Paziente e Admission in transazione.
 */
export const insertNewAdmissionFn = catchAsync(async (req, res) => {
	const {
		nome, cognome, dataNascita, sex, codiceFiscale, // Dati Paziente
		patologiaCode, codiceColore, modalitaArrivoCode, noteTriage // Dati Accesso (Notare i suffix 'Code')
	} = req.body;

	const client = await pool.connect();

	await client.query('BEGIN');

	// 1. Upsert Paziente
	let patientRes = await client.query(
		`INSERT INTO patients (nome, cognome, data_nascita, sex, codice_fiscale)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (codice_fiscale) DO UPDATE SET nome    = EXCLUDED.nome,
                                                    cognome = EXCLUDED.cognome
         RETURNING id`,
		[nome, cognome, dataNascita, sex, codiceFiscale]
	);
	const patientId = patientRes.rows[0].id;

	// 2. Generazione Braccialetto
	const year = new Date().getFullYear();
	const countRes = await client.query(`SELECT COUNT(*)
                                         FROM admissions
                                         WHERE braccialetto LIKE $1`, [`${year}-%`]);
	const nextNum = Number.parseInt(countRes.rows[0].count) + 1;
	const braccialetto = `${year}-${String(nextNum).padStart(4, '0')}`;

	// 3. Insert Accesso
	const insertQuery = `
        INSERT INTO admissions
        (patient_id, braccialetto, stato, patologia_code, codice_colore, modalita_arrivo_code, note_triage)
        VALUES ($1, $2, 'ATT', $3, $4, $5, $6)
        RETURNING id, braccialetto
	`;

	const insertAdm = await client.query(insertQuery, [
		patientId, braccialetto, patologiaCode, codiceColore, modalitaArrivoCode, noteTriage
	]);

	await client.query('COMMIT');

	// Restituisco l'ID creato così il frontend può navigare al dettaglio
	res.status(201).json({
		status: 'success',
		message: "Accesso creato con successo",
		data: {
			id: insertAdm.rows[0].id,
			braccialetto: insertAdm.rows[0].braccialetto
		}
	});
});

/**
 * PATCH /admissions/:id/status
 */
export const changeAdmissionsStatusByIDFn = catchAsync(async (req, res, next) => {
	const {id} = req.params;
	const {nuovoStato} = req.body; // Es. 'VIS', 'DIM'

	// Validazione semplice
	const allowed = ['ATT', 'VIS', 'OBI', 'RIC', 'DIM'];
	if (!allowed.includes(nuovoStato)) {
		return next(new AppError("Stato non valido fornito", 400));
	}
	const result = await pool.query(
		`UPDATE admissions
         SET stato      = $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING id, stato`,
		[nuovoStato, id]
	);

	if (result.rows.length === 0) return next(new AppError("Accesso non trovato", 404));

	res.status(200).json({
		status: 'success',
		data: result.rows[0]
	});
});
