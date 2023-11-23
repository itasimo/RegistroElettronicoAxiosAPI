# RegistroElettronicoAxiosAPI
Questa repository è un API progettata per il registro elettronico Axios.
## Come funziona
In un file `.mjs` importare l'API 

`import {RegistroAxiosAPI} from './RegistroElettronicoAxiosAPI/axios.mjs'`

Per fare una chiamata all'API registro chiamare la funzione

`await RegistroAxiosAPI(CodiceFiscale, CodiceUtente, Password, Azione)`

L' API risponde con un JSON contenete le informazioni

|    Parametro    |  Spiegazione | Necessario per login |
|-----------------|--------------|:----------------------:|
|**CodiceFiscale**|Codice Fiscale della scuola  |:heavy_check_mark:|
| **CodiceUtente**|Codice Utente dell' utente   |:heavy_check_mark:|
|   **Password**  | Password dell' utente       |:heavy_check_mark:|
|    **Azione**   | Password dell' utente       |:x:|


 - **Voti**: 
	  - La risposta contiene tutti i voti pubblicati fino al momento della chiamata;
	 - Risponde con informazioni riguardanti: 
		- Materia
		- Tipo di voto
		- Voto
  		- Fa media? 
		- Data
		- Eventuali commenti
		- Professore
- **Compiti**:
	- La risposta contiene tutti i compiti pubblicati fino al momento della chiamata;
	- Risponde con informazioni riguardanti:
		- Materia
		- Data di consegna
		- Compito
		- Professore
- **Verifiche**:
	- La risposta contiene tutte le verifiche pubblicate fino al momento della chiamata;
	- Risponde con informazioni riguardanti:
		- Materia
		- Data della verifica
		- Argomenti della verifica
		- Professore
