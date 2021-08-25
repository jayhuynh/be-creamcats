import PinoHttp from "pino-http";
import PinoPretty from "pino-pretty";

export default PinoHttp({
  prettyPrint: {
    levelFirst: true,
  },
  prettifier: PinoPretty,
});
