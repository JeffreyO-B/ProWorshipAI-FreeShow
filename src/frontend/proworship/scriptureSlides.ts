import type { VerseRecord } from "./bibleLibrary"
export type ScriptureSlide = { id: string; verses: VerseRecord[]; text: string }
const MAX_CHARS = 380
const MAX_VERSES = 4
/** Paginate verse data into bounded, projection-friendly groups without splitting verses. */
export function makeScriptureSlides(verses: VerseRecord[]): ScriptureSlide[] {
    const result: ScriptureSlide[] = []
    let group: VerseRecord[] = []
    let characters = 0
    const append = () => {
        if (!group.length) return
        result.push({ id: group[0].book + "-" + group[0].chapter + "-" + group[0].verse, verses: group, text: group.map((v) => v.verse + " " + v.text).join("\n") })
        group = []
        characters = 0
    }
    for (const verse of verses) {
        if (group.length && (group.length >= MAX_VERSES || characters + verse.text.length > MAX_CHARS)) append()
        group.push(verse)
        characters += verse.text.length
    }
    append()
    return result
}
