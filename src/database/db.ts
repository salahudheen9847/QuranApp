import { openDatabase } from "react-native-sqlite-storage";
import quranData from "../data/quran.json";

const db = openDatabase({ name: "quran.db" });

export interface Surah {
  id: number;
  name: string;
  transliteration: string;
  type: string;
  total_verses: number;
}

export interface Ayah {
  id: number;
  surah_id: number;
  text: string;
}

// Initialize DB
export function initDB() {
  db.transaction((tx: any) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS surahs (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT,
        transliteration TEXT,
        type TEXT,
        total_verses INTEGER
      )`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ayahs (
        id INTEGER PRIMARY KEY NOT NULL,
        surah_id INTEGER,
        text TEXT
      )`
    );
  });
}

// Seed Qur’an with safe Bismillah
export function seedQuran() {
  db.transaction((tx: any) => {
    quranData.forEach((surah: any) => {
      tx.executeSql(
        "INSERT OR IGNORE INTO surahs (id, name, transliteration, type, total_verses) VALUES (?, ?, ?, ?, ?)",
        [surah.id, surah.name, surah.transliteration, surah.type, surah.total_verses]
      );

      surah.verses.forEach((verse: any) => {
        let text = verse.text.trim();
        if (verse.id === 1 && surah.id !== 9 && !text.startsWith("بسم الله")) {
          text = "بسم الله الرحمن الرحيم " + text;
        }
        const uniqueAyahId = surah.id * 1000 + verse.id;
        tx.executeSql("INSERT OR IGNORE INTO ayahs (id, surah_id, text) VALUES (?, ?, ?)", [
          uniqueAyahId,
          surah.id,
          text,
        ]);
      });
    });
  });
}

// Queries
export function getSurahs(callback: (rows: Surah[]) => void) {
  db.transaction((tx: any) => {
    tx.executeSql("SELECT * FROM surahs ORDER BY id ASC", [], (_: any, result: any) => {
      callback(result.rows.raw() as Surah[]);
    });
  });
}

export function getAyahsBySurah(surahId: number, callback: (rows: Ayah[]) => void) {
  db.transaction((tx: any) => {
    tx.executeSql(
      "SELECT * FROM ayahs WHERE surah_id = ? ORDER BY id ASC",
      [surahId],
      (_: any, result: any) => {
        callback(result.rows.raw() as Ayah[]);
      }
    );
  });
}

// Utility: clear DB
export function clearDB() {
  db.transaction((tx: any) => {
    tx.executeSql("DELETE FROM surahs");
    tx.executeSql("DELETE FROM ayahs");
  });
}
