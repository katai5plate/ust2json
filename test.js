const { readUST, writeJSON, ustToJSON, writeUSTFromJSON } = require("./utils");

const ust = readUST("./una.ust");
const json = ustToJSON(ust);

writeJSON("./res.ignore.json", json);
writeUSTFromJSON("./res.ust", json);
