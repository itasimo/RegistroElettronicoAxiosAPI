Per la richiesta `GET_TIMELINE`

## Struct

Un evento è strutturato in questo modo

```json
{
	"id":"32045953",
	"type":"L",
	"data":"18/04/2024",
	"subType":"",
	"ora":"",
	"oralez":"3",
	"desc":{
		"title":"",
		"subtitle":"SCIENZE NATURALI",
		"notes":"Polmoni, ciclo respiratorio, volume corrente, volume residuo, volume di riserva, trasporto di ossigeno, trasporto di anidride carbonica"
	}
}
```

Concendarndosi si `type` può essere:

1. `C`: Comunicazioni
1. `L`: Argomenti
1. `M`: Compiti
1. `N`: Note Disciplinari
1. `A`: Assenza
1. `V`: Voti

### Assenza

Nel caso dell'assenza è usato anche il parametro `subType`:

```json
    {
        "type": "A",
        "data": "18/04/2024",
        "desc": {
            "title": "",
            "subtitle": "",
            "notes": ""
        },
        "subType": "U",
        "ora": "12:20:00",
        "oralez": "5"
    }
```

- `U`: Uscita Anticipata
- `R`: Ritardo / Entrata Posticipata

### Voto

subType è usato anche nel caso di voti per segnare il tipo:

- `O`: Orale
- `S`: Scritto
