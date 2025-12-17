# mtga-js

Make Textarea Garbage Again

## Features

- Undo, Redo: Ctrl+Z, Ctrl+Shift+Z
- Comment: Ctrl+/
- Indent: Tab, Shift+Tab
- AutoComplete: ...
- AutoPair: All brackets with commas
- AutoIndent: Press Enter inside of brackets
- LineBreak: Ctrl+Enter, Ctrl+Shift+Enter
- LineCopy: Ctrl+C with cursor on a character
- LineCut: Ctrl+X with cursor on a character
- LinePaste: Ctrl+V with cursor on a character after single line copy e.g., "blahblah...\n"
- LineRemove: Ctrl+Shift+K

## Getting Started

[DEMO](https://shinich39.github.io/mtga-js/)

### Installation

### Usage

```html
<script src="dist/mtga.js"></script>
<script>
  const { MTGA } = window.mtgaJs;
  const el = document.getElementId("textarea");
  const mtga = new MTGA(el);
</script>
```

### Custom Module

[example/beautify.js](example/beautify.js)

## Acknowledgements

- [textarea-caret-position](https://github.com/component/textarea-caret-position)