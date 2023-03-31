import express from "express";

const truelayerAuthRouter = express.Router();

truelayerAuthRouter.post("/connect/token", (req, res) => {
  switch (req.headers["mock-return-connect-token"]) {
    case "400":
      res.status(400).json({
        error: "invalid_grant"
      });
      break;
    default:
      res.status(200).json({
        access_token: "good-access-token",
        expires_in: 3600,
        refresh_token: "refresh-token",
        token_type: "Bearer",
        scope: "info"
      });
  }
});

truelayerAuthRouter.get("/dummy", (req, res) => {
  switch (req.headers["mock-return-auth-dummy"]) {
    case "400":
      res.status(400).json({
        error: "invalid_grant"
      });
      break;
    default:
      res.status(200).json({
        requestHeaders: req.headers,
        url: `${req.protocol}://${req.hostname}${req.originalUrl}`
      });
  }
});

export default truelayerAuthRouter;
