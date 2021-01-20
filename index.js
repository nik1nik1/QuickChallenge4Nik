"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const port = process.env.port;
http.createServer(function (req, response) {
    console.log('request starting...');
    const options = {
        hostname: 'www.bom.gov.au',
        path: '/fwo/IDN60801/IDN60801.95765.json',
        headers: { 'User-Agent': 'Mozilla/5.0' }
    };
    http.get(options, (res) => {
        let body = "";
        res.on("data", (chunk) => {
            body += chunk;
        });
        res.on("end", () => {
            try {
                let match = body.match(/<TITLE>([^<]*)<\/TITLE>/); // regular expression to parse contents of the <TITLE> tag as BOM may reply error, for example: Access Denied
                if (match && typeof match[1] === 'string') {
                    response.writeHead(503, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: match[1] }));
                    throw new Error('Error, response is HTML');
                }
                let BomJson = JSON.parse(body);
                var Response = [];
                BomJson.observations.data.every((elem, index, arr) => {
                    if (elem.apparent_t > 20) {
                        var Elem = {
                            name: elem.name,
                            apparent_t: elem.apparent_t,
                            lat: elem.lat,
                            long: elem.lon
                        };
                        Response.push(Elem);
                    }
                    return true;
                });
                Response.sort(function (a, b) {
                    return a.apparent_t - b.apparent_t;
                });
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(Response));
            }
            catch (error) {
                console.error(error.message);
            }
            ;
        });
    }).on("error", (error) => {
        response.writeHead(503, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Error Connecting to BOM.' }));
        console.error(error.message);
    });
    console.log('request END...');
}).listen(port);
//# sourceMappingURL=server.js.map
