import {Server} from "http";
import {AddressInfo} from "net";

import express from "express";

import starlingRouter from "./starling/router/starlingRouter";
import truelayerAuthRouter from "./truelayer/routers/authRouter";
import truelayerDataRouter from "./truelayer/routers/dataRouter";

const app = express();
let server: Server;

app.use("/starling", starlingRouter);
app.use("/truelayer/auth", truelayerAuthRouter);
app.use("/truelayer/data", truelayerDataRouter);

const port = process.env.PORT || 3000;

export const listen = async () =>
  await new Promise<void>(
    resolve =>
      (server = app.listen(port, () => {
        const serverAddress = server.address() as AddressInfo;
        console.log(`Running mock server on port '${serverAddress.port}'...`);
        server.timeout = 5000;
        resolve();
      }))
  );

export const close = async () =>
  await new Promise<void>(resolve =>
    server.close(() => {
      console.log("Closed mock server.");
      resolve();
    })
  );
