import { htmlParser, querySelector, querySelectorAll, dataset, attrOf } from "../utils";
import { convertLookup, commonConvertLookups, splitDateTime } from "@/utils";

export default async function parseComunicazioni(comunicazioniArray, webClientInstance) {
    const result = [];

    for (const comunicazione of comunicazioniArray) {
        const intId = comunicazione.id; // ID interno usato per identificare univocamente la comunicazione (serve per le risposte e conferme di lettura)

        const root = htmlParser(comunicazione.detailsResponse);

        // Main body della comunicazione
        const containerChildren = querySelectorAll(querySelector(root, '.modal-title .mt-comment-body .col-md-2 .text-center'), '*');
        // La data è divisa in 3 div separati, il mese è scritto in lettere e va convertito in numero
        const data = `${containerChildren[0].textContent.trim()}/${convertLookup(containerChildren[1].textContent.trim(), commonConvertLookups.mesi.mesiStr, commonConvertLookups.mesi.mesiNum)}/${containerChildren[2].textContent.trim()}`;

        const titolo = querySelector(root, '.modal-title .mt-comment-body .col-md-8 b').textContent.trim();
        const autore = querySelector(root, '.modal-title .mt-comment-body .col-md-8 small').textContent.trim().replace('Pubblicata da: ', '');
        const testo = querySelector(root, '.modal-body fieldset .legend-com + div')?.textContent.trim() ?? null; // Il testo della comunicazione è opzionale, se non è presente restituiamo null
        const id = querySelector(root, 'span.badge.badge-num').textContent.trim();
        const tipo = containerChildren[3].textContent.trim();
        const letta = querySelector(root, '.modal-footer .pull-left') ?
                        querySelector(root, '.modal-footer .pull-left').textContent.trim().startsWith('Letta') : console.log(comunicazione.detailsResponse) // TODO: debug, la prima volta che le circolari vengono fetchate se ce ne sono nuove crasha qui, la seconda volta le segna come
        const allegatiCircolare = [];

        const rispostaSelect = querySelector(root, '.responseType');
        const prevedeRisposta = rispostaSelect !== null;
        const opzioniRisposta = prevedeRisposta ? Array.from(querySelectorAll(rispostaSelect, 'option')).map(option => option.textContent.trim()) : [];        
        const isRisposta = prevedeRisposta ? attrOf(rispostaSelect, 'disabled') === '' : null // Se il select è disabilitato significa che è già stata data una risposta, altrimenti no
        const rispostaTesto = isRisposta ? querySelector(rispostaSelect, 'option:checked').textContent.trim() : null;

        const isAnnullata = querySelector(root, '.modal-title .mt-comment-body .col-md-8 b.pull-right')?.textContent.trim().startsWith('ANNULLATA') ?? false;
        const rettificaOrg = isAnnullata ? querySelector(root, '.modal-body .rettifica-posit')?.textContent.trim() ?? null : null;

        // Estrai gli allegati, se presenti
        const allegatiContainer = querySelector(root, '.mt-comment-details [mt-comment-status]');
        if (allegatiContainer) {
            const allegatiButtons = querySelectorAll(allegatiContainer, 'button');
            for (const button of allegatiButtons) {
                const nome = attrOf(button, 'title')?.trim() ?? '';
                // {"url":"../../Handlers/SD_UploadDownloadHandler.aspx","root":"80127350157","folder":"SD/BACHECHE/1/","filename":"4c758203-ae82-4ad2-8e2f-43aff5b18b6d.pdf","SourceFileName":"Q2lyYy5uLjIxNi1Pcmdhbml6emF6aW9uZWdpb3JuYXRhTGlvbnNlVHVybmlzb3J2ZWdsaWFuemEoMSkucGRm","fileType":"0"}
                const dataAttr = dataset(button);
                // <button title="Uscitainorarioextrascolastico-Corsico" type="button" class="btn btn-sm  saveReaderByFileLinkPost" datadwl="1" data-root="80127350157" data-folder="SD/BACHECHE/1/" postid="usaawOd3sAA=" data-filetype="0" data-storage-filename="b38fa563-b8fe-4bec-b8e0-cda55468f1f4.pdf" data-source-filename="VXNjaXRhaW5vcmFyaW9leHRyYXNjb2xhc3RpY28tQ29yc2ljbw==" data-filename="b38fa563-b8fe-4bec-b8e0-cda55468f1f4.pdf"><i class="fa fa-fw fa-download"></i>Uscitainorarioextrascolastico-Corsico</button>
                const attributes = {
                    dataRoot: dataAttr.root,
                    dataFolder: dataAttr.folder,
                    dataFilename: dataAttr.filename,
                    dataSourceFilename: dataAttr.sourceFilename,
                    fileType: dataAttr.filetype
                };
                // Sopprimi log errori per comunicazioni annullate (i file potrebbero non essere più disponibili)
                const downloadLink = webClientInstance 
                    ? await webClientInstance.handleFileDownload(attributes, 'https://registrofamiglie.axioscloud.it/Pages/SD/SD_Dashboard.aspx', { suppressErrorLogging: isAnnullata })
                    : null; // WebClient non disponibile

                allegatiCircolare.push({
                    nome,
                    desc: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
                    downloadLink
                });
            }
        }

        result.push({
            data,
            titolo,
            autore,
            testo,
            intId,
            id,
            tipo,
            letta,
            obbligatoria: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            pin: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            modificabile: null, // Non implementato nella API WEB (DISPONIBILE NELL'API MOBILE)
            allegati: allegatiCircolare,
            risposta: {
                prevedeRisposta,
                opzioniRisposta,
                isRisposta,
                rispostaTesto
            },
            annullata: {
                isAnnullata,
                rettifica: rettificaOrg ? {
                    comunicazione: rettificaOrg.split(' - ')[0]?.replace('Rettificata con ', '').trim() ?? null,
                    autore: rettificaOrg.split(' - ')[1]?.split(' il ')[0]?.trim() ?? null,
                    data: splitDateTime(rettificaOrg.split(' - ')[1]?.split(' il ')[1]?.trim() ?? null)
                } : {
                    comunicazione: null,
                    autore: null,
                    data: null
                }
            }
        });

    }

    return result;
}