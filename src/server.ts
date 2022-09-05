import { app } from "./app";
import { sequelize } from "./api/v1/models/index"

const port = app.get("port");

const server = app.listen(port, onListening);

server.on("error", onError);

server.on("close", sequelize.close)

function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind =
        typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;

    //connect to database
    sequelize.sync({ force: true })
        .then(() => {
            console.log("connected succefully")
        })
        .catch(err => {
            console.log("connect failed")
        })

}

export default server;
