import {trueLayerAuthApiHandlers} from "./trueLayer/authAPI/authAPIHandlers";
import {handlers as trueLayerDataApiHandlers} from "./trueLayer/dataAPI/dataAPIHandler";

export const handlers = [
  ...trueLayerAuthApiHandlers,
  ...trueLayerDataApiHandlers
];
