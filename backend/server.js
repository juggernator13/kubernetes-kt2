const http = require("http");

const port = 3000;
const message = process.env.MESSAGE || "Hello from backend";
const apiKeyConfigured = Boolean(process.env.API_KEY);

const server = http.createServer((req, res) => {
    if (req.url === "/api" || req.url === "/api/") {
        const response = {
            message,
            apiKeyConfigured
        };

        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
        });

        res.end(JSON.stringify(response));
        return;
    }

    res.writeHead(404, {
        "Content-Type": "application/json; charset=utf-8"
    });

    res.end(JSON.stringify({
        error: "Not found"
    }));
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Backend listening on port ${port}`);
});
