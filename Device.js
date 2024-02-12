var CallBack = function() {
    return {
        Success: function(a, b) {
            if (Metronic.unblockUI(), !a || "0" !== a.errorcode) bootbox.alert(a.errormsg);
            else if (void 0 !== a.json) {
                for (var c = JSON.parse(a.json), d = 0; d < c.length; d++) void 0 !== c[d].html && $(c[d].id).html(c[d].html), void 0 !== c[d].value && $(c[d].id).attr("value", c[d].value);
                b && $("#modal-stack-" + iStackModal).modal("hide")
            }
            return !1
        },
        Error: function(a) {
            return Metronic.unblockUI(), bootbox.alert(a), !1
        }
    }
}(),
Device = function() {
    return {
        InitPadDelete: function(a, b, c) {
            let d = $("#" + a).dataTable();
            d.on("click", "." + b, function(a) {
                a.preventDefault();
                let b = $(this).parents("tr")[0],
                    e = b.cells[0].innerHTML;
                return !!(c && e) && (bootbox.confirm("Eliminare il Pad selezionato", function(a) {
                    a && AJX.ajaxDo("../../Pages/COMMON/DEVICE/DEVICE_Ajax_Post.aspx?action=" + c + "&Others=" + e, {
                        timeout: 12e4,
                        cache: !1,
                        async: !0,
                        loadingText: "Elaborazione in corso ...",
                        successCallBack: function(a) {
                            return d.fnDeleteRow(b), CallBack.Success(a)
                        },
                        errorCallBack: CallBack.Error,
                        type: "GET",
                        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                        dataType: "json"
                    })
                }), !1)
            })
        },
        InitPadUpdate: function(a) {
            let b = $(a).data("action");
            if (b) {
                let c = $(a).data("others") || "",
                    d = JSON.stringify($(a).data("json") || ""),
                    e = ($(a).attr("url") || $(a).attr("href")) + "?Action=" + b + "&Others=" + c;
                SDModal.openModalWithPost(e, d, "60%", "", 0, 450)
            }
            return !1
        },
        Picker: function() {
            return {
                init: function(a) {
                    Calendar.initJSAndCSS(), $(a).each(function() {
                        let a = $(this).data("format") || "DD/MM/YYYY HH:mm";
                        $(this).datetimepicker({
                            locale: "it",
                            format: a,
                            useCurrent: !1,
                            toolbarPlacement: "top",
                            viewMode: "days",
                            inline: !1,
                            sideBySide: !0
                        }).on("dp.change", function() {
                            $(this).change()
                        })
                    })
                }
            }
        }(),
        DoPostAction: function(a, b) {
            let c = $(a).data("action");
            if (c) {
                let d = $(a).data("others") || "",
                    e = $(a).data("json") || "",
                    f = ($(a).attr("url") || $(a).attr("href")) + "?Action=" + c + "&Others=" + d;
                if (void 0 !== $(a).data("form")) {
                    let b = $("#" + $(a).data("form") || "");
                    if (b && b.validate().form()) {
                        let a = b.serializeObject();
                        e = JSON.stringify(a)
                    } else return !1
                }
                AJX.ajaxDo(f, {
                    timeout: 12e4,
                    cache: !1,
                    async: !0,
                    loadingText: "Salvataggio in corso ...",
                    successCallBack: function(a) {
                        CallBack.Success(a, !!b)
                    },
                    errorCallBack: CallBack.Error,
                    type: "POST",
                    data: e,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    dataType: "json"
                })
            }
            return !1
        },
        DoExportStampa: function(a) {
            let b = $(a).data("action");
            if (b) {
                function c(a) {
                    if ("0" != a.errorcode) bootbox.error(a.errormsg);
                    else if (void 0 !== a.json) {
                        var b = JSON.parse(a.json);
                        if (!b.root || !b.temp_folder || !b.extracted_file) return;
                        f = "../../Handlers/SD_UploadDownloadHandler.aspx", window.location = f + "?CustomerID=" + b.root + "&Folder=" + b.temp_folder + "&file=" + b.extracted_file + "&faction=0001"
                    }
                    return !1
                }
                let d = $(a).data("others") || "",
                    e = $(a).data("json") || "",
                    f = ($(a).attr("url") || $(a).attr("href")) + "?Action=" + b + "&Others=" + d;
                AJX.ajaxDo(f, {
                    timeout: 12e4,
                    cache: !1,
                    async: !0,
                    loadingText: "Stampa in elaborazione ...",
                    successCallBack: c,
                    errorCallBack: function(a) {
                        bootbox.error(a.statusText)
                    },
                    type: "POST",
                    data: e,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    dataType: "json"
                })
            }
            return !1
        },
        InitPWDMessage: function(a) {
            let b = Base64.decode($(a).data("pwd-device"));
            return SDModal.openModalWithHtml("<div class=\"modal-fade\" tabindex=\"-1\" data-backdrop=\"static\" data-keyboard=\"false\"><div class=\"modal-header\"><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\"></button><h4 class=\"modal-title\"><b>Device info</b></h4></div><div class=\"modal-body\">" + b + "</div><div class=\"modal-footer\"><button title=\"Chiudi\" type=\"button\" class=\"btn btn-sm default pull-right blue\" data-dismiss=\"modal\">Chiudi</button></div></div>", !0, "40%", "", 0, 250), !1
        }
    }
}();