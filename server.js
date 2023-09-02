const config = require("./config/application.config");
const http = require("./app");
/**
 * Starts the server.
 */
http.listen(config.app.port, () => {
  console.log(`Listening on port: ${config.app.port}`);
});
