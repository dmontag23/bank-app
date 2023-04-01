import {Server} from "http";
import {AddressInfo} from "net";

import express from "express";

import truelayerAuthRouter from "./truelayerAuthRouter";
import truelayerDataRouter from "./truelayerDataRouter";

const app = express();
let server: Server;

app.use("/truelayer/auth", truelayerAuthRouter);
app.use("/truelayer/data", truelayerDataRouter);

export const listen = async () =>
  await new Promise<void>(
    resolve =>
      (server = app.listen(9091, () => {
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
