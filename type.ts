type Empty<DefaultValue = null> = DefaultValue | null;
type Default<DefaultValue> = DefaultValue;
type __ = null | undefined;
type Int<Min extends number | __ = __, Max extends number | __ = __> = number;
type Float<Min extends number | __ = __, Max extends number | __ = __> = number;
type Bool = "True" | Empty;

type SectionNames =
  | "VERSION"
  | "SETTING"
  | "PREV"
  | "NEXT"
  | "INSERT"
  | "DELETE"
  | "TRACKEND"
  | number;
type SectionName<N extends SectionNames> = N;
type PBMType = "" | "s" | "r" | "j";

interface VersionEntries {
  Version: string;
}
interface SettingEntries {
  Tempo: Float<10, 512>;
  VoiceDir: string;
  CacheDir: string;
  UstVersion?: string;
}
interface NoteEntries {
  Length: Int<1, 7680> | Default<0>;
  Lyric: string | Empty;
  NoteNum: Int<24, 107> | Default<24>;
  PreUtterance: Float<__, 59999> | Empty;
  VoiceOverlap?: Float<__, 59999> | Empty;
  Intensity?: Float<0, 200> | Empty<100>;
  Moduration?: Float<-200, 200> | Empty<100>;
  Modulation?: NoteEntries["Moduration"];
  StartPoint?: Float | Empty<0>;
  Envelope?: [
    p1: Int | Default<0>,
    p2: Int | Default<5>,
    p3: Int | Default<35>,
    v1: Int | Default<0>,
    v2: Int | Default<100>,
    v3: Int | Default<100>,
    v4: Int | Default<0>,
    type?: "" | "%" | Default<"%">,
    p4?: Int | Default<0>,
    p5?: Int | Default<10>,
    v5?: Int | Default<100>
  ];
  Tempo?: Default<SettingEntries["Tempo"]>;
  Velocity?: Float<0, 200> | Empty<100>;
  Label?: Empty;
  $direct?: Bool | Empty<"">;
  $patch?: string | Empty<"">;
  $region?: string[] | Empty<"">;
  $region_end?: string[] | Empty<"">;
  Flags?: {
    b?: Int<0, 100> | Default<0>;
    B?: Int<0, 100> | Default<50>;
    c?: Int<0, 100> | Default<50>;
    C?: Int<0, 100> | Default<0>;
    D?: Int<0, 100> | Default<0>;
    E?: Int<0, 100> | Default<0>;
    F?: Int<0, __> | Default<3>;
    g?: Int<-100, 100> | Default<0>;
    G?: true;
    h?: Int<0, 99> | Default<0>;
    H?: Int<0, 99> | Default<0>;
    L?: Int<0, 130>;
    N?: true;
    P?: Int<0, 100> | Default<86>;
    R?: true;
    t?: Int | Default<0>;
    T?: true;
    W?: true;
    Y?: Int<0, 100> | Default<100>;
    "/"?: true;
  };
  readonly "@preuttr"?: Float;
  readonly "@overlap"?: Float;
  readonly "@stpoint"?: Float;
  readonly "@filename"?: string;
  readonly "@alias"?: string;
  readonly "@cache"?: string;
  // Mode1
  PBType?: "OldData" | Default<5>;
  Piches?: Int<-2048, 2047>[];
  Pitches?: NoteEntries["Piches"];
  PitchBend?: NoteEntries["Piches"];
  PBStart?: Float | Default<0>;
  // Mode2
  PBS?: [pos: Int<-200, 200>, pitch: Float<-204.8, 204.7>];
  PBW?: Float[];
  PBY?: Float<-204.8, 204.7>[];
  PBM?: PBMType[];
  VBR?: [
    length: Float<0, 100>,
    freq: Float<64, 512>,
    depth: Float<5, 200>,
    input: Float<0, 100>,
    output: Float<0, 100>,
    phase: Float<0, 100>,
    height: Float<0, 100>,
    unuse: Empty<"">
  ];
}

type EntriesKeys =
  | keyof VersionEntries
  | keyof SettingEntries
  | keyof NoteEntries;

type UstJSON = (
  | {
      section: SectionName<"VERSION">;
      entries: VersionEntries;
    }
  | {
      section: SectionName<"SETTING">;
      entries: SettingEntries;
    }
  | {
      section: SectionName<"TRACKEND">;
      entries: undefined;
    }
  | {
      section: Exclude<SectionNames, "VERSION" | "SETTING" | "TRACKEND">;
      entries: NoteEntries;
    }
)[];
