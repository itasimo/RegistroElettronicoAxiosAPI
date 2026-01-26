import toWEBSession from "./toWEBSession";
import {
    htmlParser,
    innerText,
    innerHTML,
    attrOf,
    dataset,
    querySelectorAll,
    querySelector,
    firstAnchorHref,
    decodeHtmlEntities,
} from "./htmlHelpers";
import handleFileDownload from "./getDownloadLink";
import getRowsFromTable from "./getRowsFromTable";

export {
    toWEBSession,
    htmlParser,
    querySelectorAll,
    querySelector,
    innerText,
    innerHTML,
    attrOf,
    dataset,
    firstAnchorHref,
    decodeHtmlEntities,
    handleFileDownload,
    getRowsFromTable,
};
