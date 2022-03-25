const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');
const app = express();

require('express-ws')(app);

const port = 8000;

app.use(cors());

const paintedPixels = {};
const savedCoordinates = [];

app.ws('/draw', (ws, req) => {
    const id = nanoid();
    paintedPixels[id] = ws;
    ws.send(JSON.stringify({
        type: "OLD_PIXELS",
        coordinates: savedCoordinates,
    }));
    ws.on('message', msq => {
        const decodedMessage = JSON.parse(msq);
        switch (decodedMessage.type) {
            case 'SEND_PIXEL':
                Object.keys(paintedPixels).forEach(id => {
                    const conn = paintedPixels[id];
                    savedCoordinates.push(decodedMessage.coordinates);
                    conn.send(JSON.stringify({
                        type: 'NEW_PIXEL',
                        pixelCoordinate: decodedMessage.coordinates,
                    }))
                })
                break;
            case 'CLEAR_CANVAS':
                savedCoordinates.length = 0;
                break;
            default:
                console.log("unknown type", decodedMessage.type);
        }
    })

    ws.on('close', () => {
        delete paintedPixels[id];
    });
});

app.listen(port, () => {
    console.log(`Server working on ${port} port!`);
});
