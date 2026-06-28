# mtga-js Specification

## Overview

`mtga-js` enhances a native `HTMLTextAreaElement` with editor-like behaviors while preserving the textarea as the source of truth.

The library:

- attaches keyboard, paste, focus, blur, and pointer listeners to one textarea
- applies editing behaviors through pluggable modules
- updates the textarea value and selection directly
- emits native `input` and `change` events when a value change occurs through `setState`

This specification describes the current implemented behavior.

## Scope

`mtga-js` is intended for browser environments with a real `HTMLTextAreaElement`.

The implementation currently assumes:

- the target element is a textarea
- module logic runs in the browser event loop
- keyboard shortcuts should treat `Meta` as `Control` on macOS
- line-oriented features operate on newline-delimited textarea content

## Public API

### Exports

The package exports:

- `MTGA`
- `MTGAModule`
- `AutoCompleteModule`
- `AutoIndentModule`
- `AutoPairModule`
- `CommentModule`
- `HistoryModule`
- `IndentModule`
- `LineBreakModule`
- `LineCopyModule`
- `LineCutModule`
- `LinePasteModule`
- `LineRemoveModule`

### `MTGA`

`new MTGA(el)` attaches the library to a textarea.

Constructor requirements:

- `el` must not already be registered with another `MTGA` instance
- if the element is already registered, construction throws `Error("Already initialized")`

Static helpers:

- `MTGA.exists(el)` returns whether the textarea is already registered
- `MTGA.getMTGA(el)` returns the attached instance or `undefined`
- `MTGA.isNavigatorSupported()` returns whether `navigator` exists
- `MTGA.isClipboardWriteSupported()` returns whether `navigator.clipboard.writeText` is available

Default event listener options:

- `capture: true`
- `once: false`
- `passive: false`

Instance fields:

- `element`: the target textarea
- `modules`: module map keyed by module name
- `moduleOrder`: modules sorted by ascending `index`

Instance methods:

- `setEvents()` registers event listeners
- `removeEvents()` unregisters event listeners
- `destroy()` removes listeners, clears module references, clears internal key state, and unregisters the textarea
- `setModuleOrder()` sorts `modules` by module `index`
- `getModule(name)` returns a typed module instance or `undefined`
- `setModule(module)` adds or replaces a module and re-sorts module order
- `removeModule(name)` removes a module if present and re-sorts module order
- `getState(withValue?)` returns normalized selection state
- `setState(state, beforeHistory = true, afterHistory = true)` updates textarea value and selection and optionally records history before and after
- `addHistory(withPrune = true)` delegates to `HistoryModule`
- `removeHistory()` removes the most recent history item

## State Model

Selection state is normalized as:

- `short`: the smaller selection boundary
- `long`: the larger selection boundary
- `dir`: native `selectionDirection`
- `isReversed`: whether the native selection direction is backward
- `value`: optional textarea value snapshot

`setState` behavior:

- updates `el.value` only when `state.value` is provided and differs from the current value
- always applies `setSelectionRange(state.short, state.long, state.dir)`
- focuses the textarea after setting selection
- dispatches bubbling `input` and `change` events only if the value changed

## Event Dispatch Model

The `MTGA` instance forwards events to all modules in ascending `index` order.

Supported module hooks:

- `onKeydown`
- `onKeyup`
- `onPaste`

If a keydown handler prevents default:

- later modules still receive the event in the current loop order
- `_keydownState` is cleared after dispatch completes

If a keydown handler does not prevent default and the key is not a pure modifier:

- `_keydownState` is saved with the pre-keyup value and selection

On focus:

- history is recorded asynchronously on the next macrotask
- a `pointerup` listener is attached to capture selection changes

On pointerup:

- history is recorded without pruning redo entries

On blur:

- the `pointerup` listener is removed

## Default Modules

The constructor installs the following modules by default:

1. `HistoryModule` with `index = 0`
2. `CommentModule`
3. `IndentModule`
4. `LineBreakModule`
5. `LineRemoveModule`
6. `LineCutModule`
7. `LineCopyModule`
8. `LinePasteModule`
9. `AutoIndentModule`
10. `AutoPairModule`
11. `AutoCompleteModule` with `index = 1`

Because modules are sorted by `index`, the effective early-order modules are:

1. `HistoryModule`
2. `AutoCompleteModule`
3. all remaining modules in constructor insertion order

All remaining default modules use the inherited default `index` of `9999`.

## History Behavior

`HistoryModule` maintains an in-memory array of editor states.

Defaults:

- `maxCount = 390`

Keyboard shortcuts:

- `Ctrl+Z` or `Meta+Z`: undo
- `Ctrl+Shift+Z` or `Meta+Shift+Z`: redo

Rules:

- undo and redo prevent the browser default
- undo moves backward through saved states
- redo moves forward toward the newest state
- applying undo or redo does not create additional history entries
- when new history is added after undo, redo entries are pruned
- duplicate consecutive states are not stored
- when `maxCount` is exceeded, the oldest state is dropped

Automatic history capture:

- on keyup after a value change, a new history entry is added
- on keyup after only a caret or selection move, a history entry may be added without pruning redo entries
- on focus, an initial state is captured asynchronously
- pointer-based selection changes are also captured

## Keyboard Shortcut Semantics

Shortcut parsing rules:

- `ctrlKey` is treated as `event.ctrlKey || event.metaKey`
- most editing shortcuts require `Alt` to be false
- IME composition events are ignored by composition-sensitive modules

## Module Specifications

### `CommentModule`

Defaults:

- line comment pattern: `/\/\/\s?/`
- inserted line comment text: `"// "`

Shortcuts:

- `Ctrl+/` or `Meta+/`: toggle line comments on selected rows
- `Shift+*` immediately after typing `/` with no active selection: expands to `/**/` and leaves the caret between `*` and `*/`

Line comment rules:

- selected rows are determined by the current selection range
- for multi-line selections, comment insertion aligns to the smallest shared leading whitespace among non-empty selected rows
- when a multi-line selection includes both empty and non-empty rows, empty rows are left unchanged during insertion
- uncommenting removes the shared aligned comment prefix when all target rows already match it
- single-line toggling uses that line's own leading whitespace as the alignment base
- selection offsets are adjusted to remain aligned with the transformed text

### `IndentModule`

Defaults:

- indent pattern: `/^[^\S\n\r][^\S\n\r]?/`
- indent text: `"  "` (two spaces)

Shortcuts:

- `Tab`: indent selected rows
- `Shift+Tab`: outdent selected rows

Rules:

- the module always prevents the browser default tab behavior
- multi-line indent skips insertion on whitespace-only rows
- outdent removes at most one match of the configured indent pattern per selected row
- single-line indent inserts the indent text even on an empty line
- selection offsets are updated to remain stable after transformation

### `LineBreakModule`

Defaults:

- bracket pairs: `()`, `[]`, `{}`
- indent unit: `"  "`

Shortcuts:

- `Ctrl+Enter` or `Meta+Enter`: insert a new line after the active row
- `Ctrl+Shift+Enter` or `Meta+Shift+Enter`: insert a new line before the active row

Rules:

- the active row is the last selected row for `Ctrl+Enter`
- the active row is the first selected row for `Ctrl+Shift+Enter`
- the inserted line inherits indentation computed from nearby bracket context
- if the active row is the last row and the new line is inserted after it, the caret moves onto the newly created line

### `LineRemoveModule`

Shortcut:

- `Ctrl+Shift+K` or `Meta+Shift+K`: remove all selected rows

Rules:

- the browser default is prevented
- removal is line-based, not character-based
- the resulting caret is placed near the prior column within the neighboring surviving row when possible
- removing the final empty line from the document also removes the trailing line break that would otherwise remain

### `LineCopyModule`

Shortcut:

- `Ctrl+C` or `Meta+C` with no selection range: copy the current row

Rules:

- this behavior only runs when the selection is collapsed
- the copied row is written through `navigator.clipboard.writeText`
- if the copied row does not end with `\n`, the module appends one before copying
- if clipboard write support is unavailable, the module logs a warning and does nothing

### `LineCutModule`

Shortcut:

- `Ctrl+X` or `Meta+X` with no selection range: cut the current row

Rules:

- this behavior only runs when the selection is collapsed
- the current row is copied to the clipboard, with a trailing `\n` added if needed
- after a successful cut operation, the current row is removed from the textarea
- the caret moves to the start of the removed row position
- if clipboard write support is unavailable, the module logs a warning and does nothing

### `LinePasteModule`

Trigger:

- `paste` event while the selection is collapsed

Rules:

- this module only intercepts paste when the clipboard text is exactly one line plus a trailing newline
- Windows line endings are normalized to `\n`
- supported clipboard shape is equivalent to `"line contents\n"`
- when the clipboard text matches that shape, the line is inserted before the current row and the browser default paste is prevented
- multi-line clipboard content is ignored and falls back to the browser

### `AutoIndentModule`

Defaults:

- bracket pairs: `()`, `[]`, `{}`
- indent unit: `"  "`

Shortcuts and triggers:

- `Enter`: insert a new line with automatic indentation
- typing a configured closing bracket on a whitespace-only indented line may outdent the line before insertion

Rules for `Enter`:

- the browser default is prevented
- the new line normally inherits the leading whitespace of the current row
- if the trimmed current row ends with an opening bracket, one indent unit is added on the new line
- if the caret is directly before a closing bracket, the module may split the content into:
  - a new line for inner content
  - a following line for the closing bracket
- when splitting directly before a closing bracket after non-empty content, the closing bracket line is dedented by one indent unit relative to the inner line
- when the current row is whitespace-only and the caret is directly before a closing bracket, pressing `Enter` inserts only a line break and keeps the closing bracket dedented

Rules for closing bracket typing:

- IME composition is ignored
- if the current line contains only indentation and the typed key is a configured closing bracket, the module may remove one indent unit before inserting the bracket
- this outdent only occurs when the closing bracket is not already present at the caret and the preceding non-whitespace character does not already form the same pair

### `AutoPairModule`

Defaults:

- pairs: `()`, `[]`, `{}`, `<>`, `''`, `""`, and `` ` ``

Triggers:

- typing an opening pair character
- typing a closing pair character
- pressing `Backspace`

Rules:

- IME composition is ignored
- typing an opening pair character prevents default and inserts both opening and closing characters
- if a range is selected, the selection is wrapped by the pair
- if the caret is directly before the same closing character and that character has a valid opening partner, typing the closing character overtypes it by moving the caret forward
- pressing `Backspace` between an adjacent known opening and closing pair removes both characters together

### `AutoCompleteModule`

Defaults:

- `chunkSize = 100`
- default parser splits tokens around punctuation, brackets, slashes, quotes, question and exclamation marks, and line breaks
- default filter matches tags where `tag.key.indexOf(query.body) > -1`

Lifecycle:

- the module runs on keyup
- it reacts only to plain character keys and `Backspace`
- each new trigger kills any previous in-flight search process

State:

- `query`: the current parsed query or `null`
- `candidates`: the candidate tags being scanned
- `result`: accumulated matched tags

Configuration:

- `tags`: the default search space
- `indexes`: optional indexed tag groups keyed by exact string or `RegExp` pattern
- `parser`, `filter`, `onData`, and `onEnd` are replaceable behaviors

Rules:

- when the parsed query body is empty, the module clears state and stops
- if an index matches the query body, its `tags` are used as candidates; otherwise `tags` is used
- candidates are filtered asynchronously in chunks using `setTimeout(..., 0)`
- `onData` is called with each chunk of matches
- `onEnd` is called after completion or graceful stop
- `kill()` aborts the active process immediately
- `stop()` finishes the current process without immediate abort
- `set(tag, query?)` replaces the parsed query body with `tag.value` and updates the textarea through `setState`

## Line Model

Row-based modules use the following rules:

- rows are split on `\r\n`, `\r`, or `\n`
- row values preserve the newline terminator for every row except the final row
- selection membership is determined by overlap between the normalized selection range and each row span
- a collapsed caret selects exactly one row for row-based commands

## Custom Modules

Custom modules may be added with `setModule(module)`.

A custom module:

- should extend `MTGAModule`
- may implement `onKeydown`, `onKeyup`, and `onPaste`
- participates in dispatch order according to its numeric `index`
- may call `parent.getState()` and `parent.setState(...)` to integrate with history and native event dispatch

## Non-Goals and Current Limitations

This implementation currently does not specify or guarantee:

- contenteditable support
- textarea replacement UI
- syntax-aware parsing beyond simple configurable pairs and token scans
- multi-line clipboard paste transformation in `LinePasteModule`
- browser-specific fallback clipboard APIs when `navigator.clipboard.writeText` is unavailable
- deep IME handling beyond explicit composition guards in `AutoIndentModule` and `AutoPairModule`
- persistence of history across page reloads or instance destruction
