import express from "express";

const truelayerAuthRouter = express.Router();

truelayerAuthRouter.post("/connect/token", (req, res) => {
  switch (req.headers["mock-return-connect-token"]) {
    case "400":
      res.status(400).json({
        error: "invalid_grant"
      });
      break;
    case "500":
      res.status(500).json({
        error_description:
          "Sorry, we are experiencing technical difficulties. Please try again later.",
        error: "internal_server_error",
        error_details: {}
      });
      break;
    default:
      res.status(200).json({
        access_token: "truelayer-access-token",
        expires_in: 3600,
        refresh_token: "truelayer-refresh-token",
        token_type: "Bearer",
        scope: "info"
      });
  }
});

export default truelayerAuthRouter;
