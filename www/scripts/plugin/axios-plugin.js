// ---------------------------------------------------------------------------------------------------------------------------------
// SWIPE LEFT WITH BUTTONS
// ---------------------------------------------------------------------------------------------------------------------------------
$.fn.extend({

  // Questo plug-in consente di estendere le funzionalita di un li legato ad una ul aggiungendo fino a tre bottoni che appaiono
  // quando l'utente effettua uno swipe-left e scompaiono con uno swipe-right.
  // I tre bottoni (che possono essere presenti in qualunque combinazione (1 solo, 2 o tutti) hanno rispettivamente le classi:
  // - Delete: per eliminare l'li
  // - Other: per qualsiasi cosa da fare attraverso una callback
  // - Flag: per flaggare (selezionare) l'li e deselezionarlo
  // In tutti e tre i casi è possibile indicare nel listener una callback che ritorna l'id dell'li usato (per far questo nell'html deve essere presente
  // per ogni li l'attributo data-id=xx).
  // Nel listener primario è possibile indicare con il parametro icon=true che saranno icone quelle visualizzate e non testi, ovviamente nell'html e nella chiamata 
  // al listener addListenerFlag occorre indicare i testi (o i caratteri icona) per flagged e unflagged e quanti sono i bottoni
  // NB ls classe axios-li-swipe deve essere presente in ogni li.
  
  /*
    Esempio di HTML:
    <ul data-role="listview">
      <li class="axios-li-swipe" data-id="1" data-allow="true"> <-- la classe, l'id e il permesso di eliminazione
        <span class="delete btn">                               <-- delete button 
          &#9746;                                               <-- esempio di icona carattere (ref. http://character-code.com)
        </span>
        <span class="flag btn">                                 <-- flag/unflag button 
          &#9745;
        </span>
        <span class="other btn">                                <-- other button (può fare qualunque cosa tipo aprire un pop-menu) 
          &#9776;
        </span>
        <a href="#" draggable="false">                          <-- draggable="false" obbligatorio
          Elemento 1 stat rosa pristina nomine, nomina nuda tenemus
          <span class="flagged ui-screen-hidden">               <-- classi obbligatorie
          </span>
        </a>
      </li>
    </ul>

    Esempio di JS:
    // NB Se nell'html della ul non sono presenti alcuni dei bottoni non è necessario associare il descrittore di quel bottone
    $("ul li.axios-li-swipe a").addListenerSwipe(true); // Se il parametro è true significa che i testi sono icone
    $("ul li span.delete").addListenerDelete(callbackDelete, msgAllow, msgNoAllow); // Vedi codice per significato msgXXX
    $("ul li span.other").addListenerOther(callbackOther); // Esempio di richiesta di callback (se non serve per qualche bottone non indicare o indicare undefined)
    $("ul li span.flag").addListenerFlag(undefined, "&#9745;", "&#9744;"); // Usare il localize qui se non è true il parametro in addListenerSwipe

    function callbackOther(id) {
      alert("Hai cliccato su Altro con ID=" + id);
    };
  */
  ulSelector: "",

  //addListenerSwipe: function (icon, button) { REMOVE:
  addListenerSwipe: function (selector, icon) {
    ulSelector = selector;
    if (icon === undefined) icon = true;
    var size, height;

    $(this).on("swipeleft", function (e) {
      $(this).prevAll("span").addClass("show");
      
      if (icon) {
        // In base a icon o no stabilisce il size del singolo span [e ricalcola lo spazio di swipe (translateX) REMOVE: tra quadre]
        size = 40;
        $(this).prevAll("span").css({
          "font-size": "1.7em",
          "width": size + "px"
        });
        //$(this).css({ REMOVE:
        //  transform: "translateX(-" + size * button +  "px)"
        //});
      } else {
        size = 60;
        var ul = $(this).closest("ul");
        //height = ul.children('li:last-child').height() - 2; // Prende altezza dell'ulrtimo li e toglie 2 px perchè gli li non sono tutti uguali e l'ultimo è il più grande 
        //height = ul.children('li').height() - 2; // Prende altezza dell'ulrtimo li e toglie 2 px perchè gli li non sono tutti uguali e l'ultimo è il più grande 
        height = $(this).closest("li").height() - 2;
        $(this).prevAll("span").css({
          "font-size": "0.9em",
          "padding-top": "10px", // Per centrare orizzontalmente
          "width": size + "px",
          "height": height + "px" // Dinamico
        });
        //$(this).css({ REMOVE:
        //  //transform: "translateX(-" + size * button + "px)"
        //}).blur();
      }

      $(this).off("click").blur();

      // LEARN: per esempi su transform con tranlsateX, transitionend ecc. riferirsi learn.txt (LI SWIPE DELETE)
    });

    $(this).on("swiperight", function () {
      $(this).prevAll("span").removeClass("show");
      //$(this).css({ REMOVE:
      //  //transform: "translateX(0)"
      //}).blur();
      $(this).prevAll("span").css({
        "width": "0" // Questo 'fire' la transition (ref. index.css)
      });

    });
  },

  addListenerOther: function (callback) {
    $(ulSelector + " li span.other").on("click", function () {
      var li = $(this).closest("li");
      var id = parseInt(li.attr("data-id"));
      if (callback != undefined) callback(id);
    });
  },

  addListenerFlag: function (callbackListen, flaggedText, unflaggedText) {
    $(ulSelector + " li span.flag").on("click", function () {
      var text = $(this);
      var button = $(this).siblings("a");
      var flagged = button.find(".flagged").hasClass("ui-screen-hidden") ? false : true;
      if (!flagged) {
        button.find(".flagged").removeClass("ui-screen-hidden");
        text.html(unflaggedText);
      } else {
        button.find(".flagged").addClass("ui-screen-hidden");
        text.html(flaggedText);
      }
      var li = $(this).closest("li");
      var id = parseInt(li.attr("data-id"));
      if (callbackListen != undefined) callbackListen(id);
    });
  },

  addListenerDelete: function (callbackListen, msgAllow, msgNoAllow) {
    // msgAllow contiene il messaggio con la richiesta di conferma eliminazione, msgNoAllow contine un messaggio che informa che l'elemento non è eliminabile, 
    // entrambi devono essere già localized
    $(ulSelector + " li span.delete").on("click", function () {
      var $this = $(this);
      var li = $this.closest("li");
      var id = parseInt(li.attr("data-id"));
      var allow = li.attr("data-allow");

      // Confermi eliminazione?
      if (allow === undefined || allow == 'true') {
        if (msgAllow != undefined && msgAllow != null) {
          MSC.messageBox(msgAllow.text, callBack, msgAllow.title, msgAllow.buttons);
        } else {
          callback(1);
        }
      } else {
        // Record non eliminabile
        if (msgNoAllow != undefined && msgNoAllow != null) {
          MSC.messageBox(msgNoAllow.text, callBackNoAllow, msgNoAllow.title, msgNoAllow.buttons);
        } else {
          callBackNoAllow();
        }
        function callBackNoAllow() {
          // Do nothing
        }
      }

      function callBack(buttonIndex) {
        if (buttonIndex == 1) {
          // Eliminazione confermata
          var listview = $this.closest("ul");
          $(".ui-content").css({
            overflow: "hidden"
          });
          $this.parent().css({
            display: "block"
          }).animate({
            opacity: 0
          }, {
            duration: 250,
            queue: false
          }).animate({
            height: 0
          }, 300, function () {
            $(this).remove();
            listview.listview("refresh");
            $(".ui-content").removeAttr("style");
          });
        }
        if (callbackListen != undefined) callbackListen(id, buttonIndex === 1);
      }

    });
  },

});
