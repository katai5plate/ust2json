const {
  readUST,
  writeJSON,
  ustToJSON,
  writeUSTFromJSON,
  isNoteSection,
} = require("./utils");

const ust = readUST("./una.ust");
const json = ustToJSON(ust);

writeJSON("./res.ignore.json", json);

const edited = json.map((element) => {
  const { section, entries } = element;
  if (isNoteSection(section)) {
    entries.Lyric = "ぬ";
    return element;
  }
  return element;
});

writeUSTFromJSON("./res.ust", edited);
