# ust2json

UTAU スクリプトと JSON を相互変換します

```
yarn add katai5plate/ust2json
```

```js
const {
  readUST,
  writeJSON,
  ustToJSON,
  writeUSTFromJSON,
  isNoteSection,
} = require("ust2json");

// UST を読み込む
const ust = readUST("./sample.ust");
// UST を JSON に変換
const json = ustToJSON(ust);

// JSON を書き出す
writeJSON("./result.json", json);

// JSON のすべての歌詞を「ぬ」に変更
const edited = json.map((element) => {
  const { section, entries } = element;
  if (isNoteSection(section)) {
    entries.Lyric = "ぬ";
    return element;
  }
  return element;
});

// 変更を加えた JSON を UST として書き出す
writeUSTFromJSON("./res.ust", edited);
```
