import { BIBLE_BOOKS, type ScriptureSelection } from "./scriptureReference"

export type VerseRecord = { book: string; chapter: number; verse: number; text: string }
export type BibleLibrary = { translation: string; verses: VerseRecord[] }
const bookMap = new Map(BIBLE_BOOKS.map((book) => [book.toLowerCase().replace(/[^a-z0-9]/g, ""), book]))
const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")

export function parseBibleLibrary(input: unknown): BibleLibrary {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Expected a Bible JSON object")
    const data = input as Record<string, unknown>
    if (!Array.isArray(data.verses)) throw new Error("Expected a verses array")
    if (data.verses.length > 45000) throw new Error("The library exceeds the 45,000 verse safety limit")
    const translation = typeof data.translation === "string" ? data.translation.trim().slice(0, 50) : "Imported"
    const verses: VerseRecord[] = []
    for (const item of data.verses) {
        if (!item || typeof item !== "object" || Array.isArray(item)) continue
        const v = item as Record<string, unknown>
        const book = bookMap.get(normalise(String(v.book ?? "")))
        const chapter = Number(v.chapter)
        const verse = Number(v.verse)
        if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > 150 || !Number.isInteger(verse) || verse < 1 || verse > 176 || typeof v.text !== "string") continue
        const text = v.text.trim()
        if (!text || text.length > 12000) continue
        verses.push({ book, chapter, verse, text })
    }
    if (!verses.length) throw new Error("No valid verses found; expected { translation, verses: [{ book, chapter, verse, text }] }")
    return { translation: translation || "Imported", verses }
}

export function findPassage(library: BibleLibrary, selection: ScriptureSelection): VerseRecord[] {
    const finalChapter = selection.endChapter ?? selection.chapter
    const finalVerse = selection.endVerse ?? (selection.startVerse ?? 176)
    return library.verses.filter((v) => v.book === selection.book && v.chapter >= selection.chapter && v.chapter <= finalChapter && (v.chapter !== selection.chapter || selection.startVerse === null || v.verse >= selection.startVerse) && (v.chapter !== finalChapter || v.verse <= finalVerse)).sort((a,b) => a.chapter - b.chapter || a.verse - b.verse).slice(0, 250)
}
