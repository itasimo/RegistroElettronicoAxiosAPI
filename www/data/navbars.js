var FAMILY_NAVBAR_JSON = [
    {
      "id": "dashboard",
      "title": "SCUOLA DIGITALE",
      "idImage": "li-navbar-img-none",
      "dashboardFunction": "APP.showDashboard",
      "default": "true",
      "sidebar": [
        {
          "id": "liStudente",
          "image": "images_custom/Student Male Filled-100.png",
          "title": "Studenti",
          "subTitle": "Nome Studente",
          "idCounter": "",
          "function": "STUDENTI.showStudenti"
        },
        {
          "id": "liVoti",
          "image": "images_custom/Test Failed Filled-100.png",
          "title": "Voti",
          "subTitle": "Valutazioni",
          "idCounter": "",
          "function": "VOTIDETAIL.showVotiDetail"
        },
        {
          "id": "liAssenze",
          "image": "images_custom/Being Sick Filled-100.png",
          "title": "Assenze",
          "subTitle": "Gestione Assenze",
          "idCounter": "",
          "function": "ASSENZEMASTER.showAssenzeMaster"
        },
        {
          "id": "liNote",
          "image": "images_custom/Note Filled-100.png",
          "title": "Note",
          "subTitle": "Provvedimenti disciplinari",
          "idCounter": "",
          "function": "NOTEMASTER.showNoteMaster"
        },
        {
          "id": "liCompiti",
          "image": "images_custom/Class Filled-100.png",
          "title": "Compiti (RE/Collabora)",
          "subTitle": "Compiti Assegnati",
          "idCounter": "",
          "function": "COMPITIMASTER.showCompitiMaster"
        },
        {
          "id": "liOrario",
          "image": "images_custom/Orario-100.png",
          "title": "Orario",
          "subTitle": "Orario Lezioni",
          "idCounter": "",
          "function": "ORARIOMASTER.showOrarioMaster"
        },
        {
          "id": "liArgomenti",
          "image": "images_custom/Classroom Filled-100.png",
          "title": "Lezioni (RE/Collabora)",
          "subTitle": "Argomenti Lezioni",
          "idCounter": "",
          "function": "ARGOMENTIMASTER.showArgomentiMaster"
        },
        {
          "id": "liMaterialeDidattico",
          "image": "images_custom/MaterialeDidattico-100.png",
          "title": "Materiale Didattico",
          "subTitle": "Materiale Didattico",
          "idCounter": "",
          "function": "MATERIALEDIDATTICOMASTER.showMaterialeDidatticoMaster",
          "label": "Materiale Didattico"
        },
        {
          "id": "liComunicazioni",
          "image": "images_custom/PDF Filled-100.png",
          "title": "Comunicazioni",
          "subTitle": "Comunicazioni",
          "idCounter": "countComunicazioni",
          "function": "COMMASTER.showComunicazioniMaster"
        },     
        {
          "id": "liCentroNotifiche",
          "image": "images_custom/notification-logo-100-red.png",
          "title": "Notifiche",
          "subTitle": "Notifiche Push",
          "idCounter": "countNotifiche",
          "function": "NOTIFICHEMASTER.showNotificheMaster"
        },
        {
          "id": "liColloqui",
          "image": "images_custom/Meeting Filled-100.png",
          "title": "Colloqui",
          "subTitle": "Docenti-Familiari",
          "idCounter": "",
          "function": "COLLOQUIMASTER.showColloquiMaster"
        },
        {
          "id": "liAutorizzazioni",
          "image": "images_custom/Auth-100.png",
          "title": "Autorizzazioni",
          "subTitle": "Autorizzazioni Scolastiche",
          "idCounter": "",
          "function": "AUTORIZZAZIONIMASTER.showAutorizzazioniMaster"
        },
        {
          "id": "liPagella",
          "image": "images_custom/Page Overview 2 Filled-100.png",
          "title": "Pagella",
          "subTitle": "Pagella",
          "idCounter": "",
          "function": "PAGELLAMASTER.showPagellaMaster"
        },
        {
          "id": "liCurriculum",
          "image": "images_custom/Diploma 1 Filled-100.png",
          "title": "Curriculum",
          "subTitle": "Curriculum Scolastico",
          "idCounter": "",
          "function": "CURRICULUMMASTER.showCurriculumMaster"
        },
        {
          "id": "liMessaggi",
          "image": "images/Message-100.png",
          "title": "Messaggi",
          "subTitle": "Gestione posta",
          "idCounter": "countMessaggi",
          "function": "APP.showMessaggi"
        },
        {
          "id": "liCalendario",
          "image": "images/Calendar-100.png",
          "title": "Calendario",
          "subTitle": "Gestione Eventi",
          "idCounter": "countCalendario",
          "function": "APP.showCalendarioMese"
        },
        {
          "id": "liNotifiche",
          "image": "images/Notify-100.png",
          "title": "Notifiche",
          "subTitle": "Gestione Notifiche",
          "idCounter": "countNotifiche",
          "function": "APP.showNotifiche"
        },
        {
          "id": "liSynchro",
          "image": "images/Synchronize-100.png",
          "title": "Sincronizzazioni",
          "subTitle": "Gestione Sincronizzazioni",
          "idCounter": "countSynchro",
          "function": "APP.showSynchro"
        },
        {
          "id": "liPagoscuola",
          "image": "images_custom/Pagoscuola-100.png",
          "title": "PagoScuola",
          "subTitle": "PagoScuola",
          "idCounter": "",
          "function": "PAGOSCUOLAMASTER.showPagoScuolaMaster"
        },
        {
          "id": "liDocumenti",
          "image": "images_custom/Documenti-100.png",
          "title": "Documenti",
          "subTitle": "Documenti",
          "idCounter": "",
          "function": "DOCUMENTIMASTER.showDocumentiMaster"
        },
        {
          "id": "liUserProfile",
          "image": "images/User-100.png",
          "title": "Utente",
          "subTitle": "Profilo e Opzioni",
          "idCounter": "",
          "function": "APP.showUserProfile"
        },
        {
          "id": "liSupport",
          "image": "images/Support-100.png",
          "title": "Assistenza",
          "subTitle": "Supporto e Assistenza",
          "idCounter": "",
          "function": "APP.showSupport"
        },
        {
          "id": "liInfo",
          "image": "images/Info-100.png",
          "title": "Informazioni",
          "subTitle": "Dati sul dispositivo",
          "idCounter": "",
          "function": "APP.showInfo"
        },
        {
          "id": "liWeb",
          "image": "images/Web-100.png",
          "title": "Versione Web",
          "subTitle": "Versione Web",
          "idCounter": "",
          "function": "APP.openWebVersion"
        },
        {
          "id": "liBacheche",
          "image": "images/Bacheche-100.png",
          "title": "Bacheche",
          "subTitle": "Bacheche",
          "idCounter": "",
          "function": "APP.openBachecheVersion"
        }
      ]
    }
  
  ]

  var STUDENTS_NAVBAR_JSON = [
    {
      "id": "dashboard",
      "title": "SCUOLA DIGITALE",
      "idImage": "li-navbar-img-none",
      "dashboardFunction": "APP.showDashboard",
      "default": "true",
      "sidebar": [
        {
          "id": "liCompiti",
          "image": "images_custom/Class Filled-100.png",
          "title": "Compiti (RE/Collabora)",
          "subTitle": "Compiti Assegnati",
          "idCounter": "",
          "function": "COMPITIMASTER.showCompitiMaster"
        },
        {
          "id": "liOrario",
          "image": "images_custom/Orario-100.png",
          "title": "Orario",
          "subTitle": "Orario Lezioni",
          "idCounter": "",
          "function": "ORARIOMASTER.showOrarioMaster"
        },
        {
          "id": "liMaterialeDidattico",
          "image": "images_custom/MaterialeDidattico-100.png",
          "title": "Materiale Didattico",
          "subTitle": "Materiale Didattico",
          "idCounter": "",
          "function": "MATERIALEDIDATTICOMASTER.showMaterialeDidatticoMaster",
          "label": "Materiale Didattico"
        },
        {
          "id": "liArgomenti",
          "image": "images_custom/Classroom Filled-100.png",
          "title": "Lezioni (RE/Collabora)",
          "subTitle": "Argomenti Lezioni",
          "idCounter": "",
          "function": "ARGOMENTIMASTER.showArgomentiMaster"
        },
        {
          "id": "liComunicazioni",
          "image": "images_custom/PDF Filled-100.png",
          "title": "Comunicazioni",
          "subTitle": "Comunicazioni",
          "idCounter": "countComunicazioni",
          "function": "COMMASTER.showComunicazioniMaster"
        },    
        {
          "id": "liCentroNotifiche",
          "image": "images_custom/notification-logo-100-red.png",
          "title": "Notifiche",
          "subTitle": "Notifiche Push",
          "idCounter": "countNotifiche",
          "function": "NOTIFICHEMASTER.showNotificheMaster"
        },
        {
          "id": "liVoti",
          "image": "images_custom/Test Failed Filled-100.png",
          "title": "Voti",
          "subTitle": "Valutazioni",
          "idCounter": "",
          "function": "VOTIDETAIL.showVotiDetail"
        },
        {
          "id": "liAssenze",
          "image": "images_custom/Being Sick Filled-100.png",
          "title": "Assenze",
          "subTitle": "Gestione Assenze",
          "idCounter": "",
          "function": "ASSENZEMASTER.showAssenzeMaster"
        },
        {
          "id": "liNote",
          "image": "images_custom/Note Filled-100.png",
          "title": "Note",
          "subTitle": "Provvedimenti disciplinari",
          "idCounter": "",
          "function": "NOTEMASTER.showNoteMaster"
        },
        {
          "id": "liAutorizzazioni",
          "image": "images_custom/Auth-100.png",
          "title": "Autorizzazioni",
          "subTitle": "Autorizzazioni Scolastiche",
          "idCounter": "",
          "function": "AUTORIZZAZIONIMASTER.showAutorizzazioniMaster"
        },
        {
          "id": "liPagella",
          "image": "images_custom/Page Overview 2 Filled-100.png",
          "title": "Pagella",
          "subTitle": "Pagella",
          "idCounter": "",
          "function": "PAGELLAMASTER.showPagellaMaster"
        },
        {
          "id": "liCurriculum",
          "image": "images_custom/Diploma 1 Filled-100.png",
          "title": "Curriculum",
          "subTitle": "Curriculum Scolastico",
          "idCounter": "",
          "function": "CURRICULUMMASTER.showCurriculumMaster"
        },
        {
          "id": "liMessaggi",
          "image": "images/Message-100.png",
          "title": "Messaggi",
          "subTitle": "Gestione posta",
          "idCounter": "countMessaggi",
          "function": "APP.showMessaggi"
        },
        {
          "id": "liCalendario",
          "image": "images/Calendar-100.png",
          "title": "Calendario",
          "subTitle": "Gestione Eventi",
          "idCounter": "countCalendario",
          "function": "APP.showCalendarioMese"
        },
        {
          "id": "liNotifiche",
          "image": "images/Notify-100.png",
          "title": "Notifiche",
          "subTitle": "Gestione Notifiche",
          "idCounter": "countNotifiche",
          "function": "APP.showNotifiche"
        },
        {
          "id": "liSynchro",
          "image": "images/Synchronize-100.png",
          "title": "Sincronizzazioni",
          "subTitle": "Gestione Sincronizzazioni",
          "idCounter": "countSynchro",
          "function": "APP.showSynchro"
        },
        {
          "id": "liInvalsi",
          "image": "images_custom/Invalsi-100.png",
          "title": "Invalsi",
          "subTitle": "Invalsi",
          "idCounter": "",
          "function": "APP.showInvalsi"
        },
        {
          "id": "liPagoscuola",
          "image": "images_custom/Pagoscuola-100.png",
          "title": "PagoScuola",
          "subTitle": "PagoScuola",
          "idCounter": "",
          "function": "PAGOSCUOLAMASTER.showPagoScuolaMaster"
        },
        {
          "id": "liDocumenti",
          "image": "images_custom/Documenti-100.png",
          "title": "Documenti",
          "subTitle": "Documenti",
          "idCounter": "",
          "function": "DOCUMENTIMASTER.showDocumentiMaster"
        },
        {
          "id": "liUserProfile",
          "image": "images/User-100.png",
          "title": "Utente",
          "subTitle": "Profilo e Opzioni",
          "idCounter": "",
          "function": "APP.showUserProfile"
        },
        {
          "id": "liSupport",
          "image": "images/Support-100.png",
          "title": "Assistenza",
          "subTitle": "Supporto e Assistenza",
          "idCounter": "",
          "function": "APP.showSupport"
        },
        {
          "id": "liInfo",
          "image": "images/Info-100.png",
          "title": "Informazioni",
          "subTitle": "Dati sul dispositivo",
          "idCounter": "",
          "function": "APP.showInfo"
        },
        {
          "id": "liWeb",
          "image": "images/Web-100.png",
          "title": "Versione Web",
          "subTitle": "Versione Web",
          "idCounter": "",
          "function": "APP.openWebVersion"
        },
        {
          "id": "liBacheche",
          "image": "images/Bacheche-100.png",
          "title": "Bacheche",
          "subTitle": "Bacheche",
          "idCounter": "",
          "function": "APP.openBachecheVersion"
        }
      ]
    }
  
  ]

  var SD_NAVBAR_JSON = [
    {
      "id": "dashboard",
      "title": "SCUOLA DIGITALE",
      "idImage": "li-navbar-img-none",
      "dashboardFunction": "APP.showSDDashboard",
      "default": "true",
      "sidebar": [
        {
          "id": "liSDAttivita",
          "image": "images_custom/Auth-100.png",
          "title": "Attività da fare",
          "subTitle": "Attività da fare",
          "idCounter": "",
          "function": "SDATTIVITAMASTER.showSDAttivitaMaster"
        },
        {
          "id": "liSDBacheca",
          "image": "images_custom/Auth-100.png",
          "title": "Bacheca",
          "subTitle": "Bacheca",
          "idCounter": "",
          "function": "SDBACHECAMASTER.showSDBachecaMaster"
        },
        {
          "id": "liSDComunicazioni",
          "image": "images_custom/Auth-100.png",
          "title": "Comunicazioni",
          "subTitle": "Comunicazioni",
          "idCounter": "",
          "function": "SDCOMUNICAZIONIMASTER.showSDComunicazioniMaster"
        },
        {
          "id": "liSDMaterialeDidattico",
          "image": "images_custom/Auth-100.png",
          "title": "Materiale Didattico",
          "subTitle": "Materiale Didattico",
          "idCounter": "",
          "function": "SDMATERIALEDIDATTICOMASTER.showSDMaterialeDidatticoMaster"
        },
        {
          "id": "liSDRicercaAnagrafiche",
          "image": "images_custom/Auth-100.png",
          "title": "Ricerca Anagrafiche",
          "subTitle": "Ricerca Anagrafiche",
          "idCounter": "",
          "function": "SDRICERCAANAGRAFICHEMASTER.showSDRicercaAnagraficheMaster"
        },
        {
          "id": "liSDRicercaDocumenti",
          "image": "images_custom/Auth-100.png",
          "title": "Ricerca Documenti",
          "subTitle": "Ricerca Documenti",
          "idCounter": "",
          "function": "SDRICERCADOCUMENTIMASTER.showSDRicercaDocumentiMaster"
        },
        {
          "id": "liSDRicercaFascicoli",
          "image": "images_custom/Auth-100.png",
          "title": "Ricerca Fascicoli",
          "subTitle": "Ricerca Fascicoli",
          "idCounter": "",
          "function": "SDRICERCAFASCICOLIMASTER.showSDRicercaFascicoliMaster"
        },
        {
          "id": "liSDRicercaProtocolli",
          "image": "images_custom/Auth-100.png",
          "title": "Ricerca Protocolli",
          "subTitle": "Ricerca Protocolli",
          "idCounter": "",
          "function": "SDRICERCAPROTOCOLLIMASTER.showSDRicercaProtocolliMaster"
        },
        {
          "id": "liSDAssenze",
          "image": "images_custom/Auth-100.png",
          "title": "Gestione Assenze",
          "subTitle": "Gestione Assenze",
          "idCounter": "",
          "function": "SDASSENZEMASTER.showSDRicercaAssenzeMaster"
        },
        {
          "id": "liSDCurriculum",
          "image": "images_custom/Auth-100.png",
          "title": "Gestione Curriculum",
          "subTitle": "Gestione Curriculum",
          "idCounter": "",
          "function": "SDCURRICULUMMASTER.showSDRicercaCurriculumMaster"
        },
        {
          "id": "liInfo",
          "image": "images/Info-100.png",
          "title": "Informazioni",
          "subTitle": "Dati sul dispositivo",
          "idCounter": "",
          "function": "APP.showInfo"
        }
      ]
    }
  
  ]
  
  