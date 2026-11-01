import { fetchEventSource } from "@microsoft/fetch-event-source";

async function streamMySQLData() {
    await fetchEventSource("http://localhost:3000/api/stream-data", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // 'Authorization': 'Bearer YOUR_TOKEN' // You can easily pass auth tokens here
        },

        onmessage(msg) {
            // Triggered when a MySQL row is received
            if (msg.event === "end") {
                console.log("All MySQL data successfully loaded.");
                return;
            }

            const rowData = JSON.parse(msg.data);
            console.log("Received row:", rowData);

            // Update your UI or state array here
            // e.g., setData(prev => [...prev, rowData]);
        },

        onerror(err) {
            console.error("Stream connection error:", err);
            // Throwing an error will prevent fetch-event-source from automatically retrying
            throw err;
        },

        onclose() {
            console.log("Stream connection closed by the server.");
        },
    });
}

// Execute the stream
streamMySQLData();
