import { fetchEventSource } from "@microsoft/fetch-event-source";

function decodeHtmlEntities(text) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.documentElement.textContent;
}
let tmp = "<%= pids %>".replaceAll("&#39;", "");
//console.log('tmp',tmp)
let tmp2 = decodeHtmlEntities(tmp);
//console.log('tmp2',tmp2)
let pidList = JSON.parse(tmp2);
//console.log(pidList)
const outputDiv = document.getElementById("output");

//line 1333 in downloads
const eventSource = new EventSource(
    "/download/get_download_sql_stream?pids=" +
        JSON.stringify(pidList) +
        "&search=<%= search_text %>&anno=<%= anno %>&output=<%= type %>&format=<%= format %>",
);

eventSource.onmessage = function (event) {
    const rowData = JSON.parse(event.data);

    const listItem = document.createElement("li");
    listItem.textContent = JSON.stringify(rowData);
    outputDiv.appendChild(listItem);
};

// Listen for the custom "end" event to close the connection cleanly
eventSource.addEventListener("end", function (event) {
    console.log(event.data);
    eventSource.close();
});

// Listen for errors
eventSource.onerror = function (err) {
    console.error("EventSource failed:", err);
    eventSource.close();
};
