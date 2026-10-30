// ProWorshipAI scripture reference parsing boundary.
// Parses references without supplying copyrighted translation text or projecting.
export type ScriptureSelection = { book: string; chapter: number; startVerse: number | null; endVerse: number | null; endChapter: number | null }
const bookNames = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"]
const aliases: Record<string, string> = { psalm: "Psalms", ps: "Psalms", songofsongs: "Song of Solomon", canticles: "Song of Solomon", rev: "Revelation", jn: "John" }
const clean = (s: string) => s.toLowerCase().replace(/[.\s]/g, "")
export const BIBLE_BOOKS = bookNames
export function parseScriptureReference(value: string): ScriptureSelection | null {
    const match = value.trim().match(/^(.+?)\s+(\d{1,3})(?::(\d{1,3})(?:\s*[-–]\s*(?:(\d{1,3}):)?(\d{1,3}))?)?$/)
    if (!match) return null
    const nameKey = clean(match[1])
    const book = aliases[nameKey] || bookNames.find((name) => clean(name) === nameKey)
    if (!book) return null
    const chapter = Number(match[2])
    const startVerse = match[3] ? Number(match[3]) : null
    const otherChapter = match[4] ? Number(match[4]) : null
    const endVerse = match[5] ? Number(match[5]) : null
    if (chapter < 1 || chapter > 150 || (startVerse !== null && (startVerse < 1 || startVerse > 176))) return null
    if ((otherChapter !== null && (otherChapter < chapter || otherChapter > 150)) || (endVerse !== null && (endVerse < 1 || endVerse > 176))) return null
    if (endVerse !== null && otherChapter === null && startVerse !== null && endVerse < startVerse) return null
    if (endVerse !== null && startVerse === null) return null
    return { book, chapter, startVerse, endVerse, endChapter: otherChapter }
}
export function formatScriptureReference(r: ScriptureSelection): string {
    return r.book + " " + r.chapter + (r.startVerse === null ? "" : ":" + r.startVerse + (r.endVerse === null ? "" : "-" + (r.endChapter !== null ? r.endChapter + ":" : "") + r.endVerse))
}

/** Autocomplete choices with consistent prefix matching. */
export function suggestBibleBooks(input: string, limit = 6): string[] {
    const needle = clean(input.trim())
    if (!needle) return []
    return bookNames.filter((book) => clean(book).startsWith(needle)).slice(0, limit)
}
