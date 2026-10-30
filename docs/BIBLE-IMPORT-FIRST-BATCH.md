# Functional Bible import — first integration batch

The Bible view can now load **actual verse text** from a JSON file selected by the operator. Nothing is uploaded to GitHub or a remote server. Imported verses are kept in application memory only until restart, and are **not** yet sent to the output display. The import accepts up to 20 MB / 45,000 verses.

## Example JSON structure
```json
{
  "translation": "My local licensed translation",
  "verses": [
    { "book": "John", "chapter": 3, "verse": 16, "text": "Insert text here from a translation you are permitted to use." },
    { "book": "John", "chapter": 3, "verse": 17, "text": "Next verse text." }
  ]
}
```

Choose **Bible** in ProWorshipAI, import the JSON file, type `John 3:16-17` and the verses will appear in the centre. You can also choose **Stories** to load a story reference, navigate chapters, expand long passages and copy a passage.

This does **not** automatically import the original private `.fsb` packs or copy restricted texts into the public fork. Those packs require the original application's authorised local importer or a properly licensed user-side export adapter.

## Not yet completed
- FreeShow slide objects and Preview/Live activation.
- Native translation packs and persistent saved library.
- Original AI transcription, lyrics and remote.
- Full ProWorshipAI operator shell / current left project library replacement.

Never enable projection before data exists and its intended output content has been validated.
