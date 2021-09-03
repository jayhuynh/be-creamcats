import PinoHttp from "pino-http";
import PinoPretty from "pino-pretty";

export const logger = PinoHttp({
  prettyPrint: {
    levelFirst: true,
  },
  prettifier: PinoPretty,
});
