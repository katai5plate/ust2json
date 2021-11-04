const fs = require("fs");
const jp = require("encoding-japanese");
const eol = require("eol");

const FLAGS_REGEX = /([A-Za-z\/])(\d+|)/;
const REGEX_HEADER = /^\[#([A-Z0-9]+)\]/;
const REGEX_PARAM = /^(.+)=(.*?)$/;

const stringifyCollection = (json) =>
  `[\n${json
    .map((el) =>
      JSON.stringify(
        el,
        (_, r) =>
          Array.isArray(r)
            ? `###ARR::${JSON.stringify(r)
                .replace(/\[/g, "[ ")
                .replace(/\]/g, " ]")
                .replace(/,/g, ", ")
                .replace(/"/g, "#:':#")}###`
            : r,
        2
      )
    )
    .join(",\n")}\n]`
    .replace(/"###ARR::(.*?)###"/g, "$1")
    .replace(/#:':#/g, '"');

module.exports.readUST = (path) => {
  const buf = fs.readFileSync(path);
  return eol.lf(jp.codeToString(jp.convert(buf, "UNICODE", jp.detect(buf))));
};
module.exports.writeJSON = (path, json) =>
  fs.writeFileSync(path, stringifyCollection(json));

const numOrText = (v) => (Number.isFinite(+v) && v !== "" ? +v : v);

/**
 * @param {EntriesKeys} k
 * @param {*} v
 * @param {(x:*)=>*} f
 * @returns {*}
 */
const parseUstValue = (k, v) => {
  if (v === "") return null;
  switch (k) {
    // txt
    case "VoiceDir":
    case "CacheDir":
    case "UstVersion":
    case "Lyric":
    case "$patch":
    case "@filename":
    case "@alias":
    case "@cache":
      return v === "" ? null : v;
    // any, ...
    case "Envelope":
      return v
        .toString()
        .split(",")
        .map((x, i) => (i === 7 ? x : Number(x)));
    // int, ...
    case "Piches":
    case "Pitches":
    case "PitchBend":
      return v.split(",").map(Number);
    // flo, ...
    case "PBW":
    case "PBY":
    case "VBR":
      return v.toString().split(",").map(Number);
    // txt, ...
    case "PBM":
      return v.split(",");
    // txt| ...
    case "$region":
    case "$region_end":
      return v.split("|");
    // int;[flo]
    case "PBS":
      return v.toString().split(";").map(Number);
    // Flags
    case "Flags":
      return v
        .toString()
        .match(new RegExp(FLAGS_REGEX, "g"))
        .reduce((p, c) => {
          const [, k, v] = c.match(FLAGS_REGEX);
          return { ...p, [k]: v !== "" ? Number(v) : true };
        }, {});
  }
  if (Number.isFinite(+v)) return +v;
  return v;
};

/**
 * @param {UstJSON} json
 */
const jsonToUst = (json) => {
  let lines = [];
  const n = (x) => (x === null ? "" : x);
  json.forEach(({ section, entries }) => {
    const sectionName = section.toString();
    lines.push(
      `[#${
        typeof section === "number"
          ? sectionName.padStart(4, 0)
          : sectionName.toUpperCase()
      }]`
    );
    if (entries)
      Object.entries(entries).forEach(
        /** @param {[EntriesKeys,*]} */
        ([k, v]) => {
          const p = (x) => lines.push(`${k}=${x}`);
          const nv = n(v);
          switch (k) {
            // origin
            case "Version":
              return lines.push(v);
            // int
            case "Length":
            case "NoteNum":
              return p((nv || 0) | 0);
            // array(,)
            case "Envelope":
            case "Piches":
            case "Pitches":
            case "PitchBend":
            case "PBW":
            case "PBY":
            case "PBM":
            case "VBR":
              return p((nv || []).join(","));
            // array(|)
            case "$region":
            case "$region_end":
              return p((nv || []).join("|"));
            // array(;)
            case "PBS":
              return p((nv || []).join(";"));
            // others
            case "Flags":
              return p(
                Object.entries(nv || {}).reduce((p, [k, v]) => p + k + v, "")
              );
          }
          // float
          if (Number.isFinite(nv)) {
            if ((nv * 10) % 10 > 0) {
              return p(nv);
            }
            if (k === "Tempo") return p(`${nv}.00`);
          }
          // text
          return p(nv);
        }
      );
  });
  return lines.join("\n");
};

module.exports.writeUSTFromJSON = (path, json) =>
  fs.writeFileSync(path, jp.convert(eol.crlf(jsonToUst(json)), "SJIS"), {
    encoding: "binary",
  });

/**
 * @param {string} ust
 * @returns {UstJSON}
 */
module.exports.ustToJSON = (ust) => {
  const script = ust.split("\n");
  let list = [];
  let entries = {};
  /** @type {SectionNames | null} */
  let section = null;
  const push = (line) => {
    const name = line.match(REGEX_HEADER)?.[1];
    if (section !== null)
      list.push({
        section,
        entries: Object.keys(entries).length ? entries : undefined,
      });
    entries = {};
    if (name) section = numOrText(name);
  };
  for (let line of script) {
    if (REGEX_HEADER.test(line)) {
      push(line);
      continue;
    }
    if (REGEX_PARAM.test(line)) {
      const [, name, body] = line.match(REGEX_PARAM);
      let value = numOrText(body);
      entries[name] = parseUstValue(name, value);
      continue;
    }
    if (section === "VERSION") {
      entries.Version = line;
      continue;
    }
    if (section === "TRACKEND") continue;
    if (line !== "") {
      if (!entries._) entries._ = [];
      entries._.push(line);
    }
  }
  push(script.slice(-1)[0]);
  return list;
};

/**
 * @param {SectionNames} section
 */
module.exports.isNoteSection = (section) =>
  section === "VERSION" || section === "SETTING" || section === "TRACKEND"
    ? false
    : true;
