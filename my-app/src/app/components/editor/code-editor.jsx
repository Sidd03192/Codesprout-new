"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
  javaLibMethods,
  javaKeywords,
  pythonLibMethods,
  pythonKeywords,
  extraPythonModules,
  extraJavaClasses,
} from "./constants";
import { PenOff, Eye } from "lucide-react";
import { addToast } from "@heroui/react";

export default function CodeEditor({
  language,
  editorRef,
  initialLockedLines,
  role,
  onLockedLinesChange,
  starterCode,
  height,
  disableMenu,
  isDisabled,
}) {
  const monacoRef = useRef(null);
  const monaco = useMonaco();
  const [lockedLines, setLockedLines] = useState(
    () => new Set(initialLockedLines || [])
  );
  const [decorIds, setDecorIds] = useState([]);
  const [hoveredLine, setHoveredLine] = useState(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const lockedLinesRef = useRef(lockedLines);
  useEffect(() => {
    lockedLinesRef.current = lockedLines;
  }, [lockedLines]);

  const isUndoing = useRef(false);
  const contentChangeListener = useRef(null);
  // --- NEW: Ref to manage listeners and the "Enter" key exception ---
  const keyDownListener = useRef(null);
  const allowNextChange = useRef(false);

  useEffect(() => {
    if (onLockedLinesChange) {
      onLockedLinesChange(Array.from(lockedLines));
    }
  }, [lockedLines, onLockedLinesChange]);

  const handleEditorMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.updateOptions({
        glyphMargin: true,
        lineNumbers: "on",
        contextmenu: disableMenu ? false : true,
      });
      editor.onKeyDown((e) => {
        // diasble ctrl option
        if (role == "teacher") return;
        console.log(role);
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;
        const isPasteKey = e.keyCode === monaco.KeyCode.KeyV;
        const isCopyKey = e.keyCode === monaco.KeyCode.KeyC;
        const isCutKey = e.keyCode === monaco.KeyCode.KeyX;

        if (isCtrlOrCmd && (isPasteKey || isCopyKey || isCutKey)) {
          e.preventDefault();
          e.stopPropagation();
          console.log("Copy/Paste/Cut keyboard shortcuts have been disabled.");
        }
      });
      // Dispose of old listeners if they exist
      if (contentChangeListener.current)
        contentChangeListener.current.dispose();
      if (keyDownListener.current) keyDownListener.current.dispose();

      // --- NEW: onKeyDown listener to detect the "Enter" key press ---
      keyDownListener.current = editor.onKeyDown((e) => {
        const position = editor.getPosition();
        if (!position) return;
        // Check for "Enter" on a locked line specifically for students
        if (
          role === "student" &&
          e.keyCode === monaco.KeyCode.Enter &&
          lockedLinesRef.current.has(position.lineNumber)
        ) {
          // Grant a one-time pass for the upcoming content change
          allowNextChange.current = true;
        }
      });

      // --- MODIFIED: onDidChangeContent listener ---
      contentChangeListener.current = editor
        .getModel()
        .onDidChangeContent((e) => {
          if (isUndoing.current) return;

          // --- EDIT PREVENTION FOR STUDENTS ---
          if (role === "student") {
            // If the "Enter" key was just approved, allow this change and reset the flag.
            if (allowNextChange.current) {
              allowNextChange.current = false;
            } else {
              // Otherwise, run the standard check to prevent illegal edits.
              let shouldUndo = false;
              const currentLockedLines = lockedLinesRef.current;

              for (const change of e.changes) {
                const startLine = change.range.startLineNumber;
                const endLine = change.range.endLineNumber;
                for (let i = startLine; i <= endLine; i++) {
                  if (currentLockedLines.has(i)) {
                    shouldUndo = true;
                    addToast({
                      title: "Dissalowed Action",
                      description: "You may not edit locked lines.",
                      color: "warning",
                      duration: 5000,
                      variant: "solid",
                    });
                    break;
                  }
                }
                if (shouldUndo) break;
              }

              if (shouldUndo) {
                isUndoing.current = true;
                editor.trigger("prevent-edit", "undo", null);

                isUndoing.current = false;
                return; // Stop processing if the change is reverted.
              }
            }
          }

          // --- UPDATE LINE NUMBERS AFTER A VALID EDIT ---
          const changes = e.changes
            .slice()
            .sort((a, b) => b.range.startLineNumber - a.range.startLineNumber);
          setLockedLines((currentLockedLines) => {
            let newLockedLines = new Set(currentLockedLines);
            changes.forEach((change) => {
              const startLine = change.range.startLineNumber;
              const endLine = change.range.endLineNumber;
              const lineCountChange =
                (change.text.match(/\n/g) || []).length - (endLine - startLine);
              if (lineCountChange !== 0) {
                const updatedLines = new Set();
                newLockedLines.forEach((lockedLine) => {
                  if (lockedLine > startLine) {
                    const newLine = lockedLine + lineCountChange;
                    if (newLine > 0) updatedLines.add(newLine);
                  } else {
                    updatedLines.add(lockedLine);
                  }
                });
                newLockedLines = updatedLines;
              }
            });
            return newLockedLines;
          });
        });

      // --- Teacher UI Event Listeners ---
      editor.onMouseMove((e) => {
        if (role === "student") return;
        const target = e.target;
        if (target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
          setHoveredLine(target.position?.lineNumber || null);
        } else {
          setHoveredLine(null);
        }
      });

      editor.onMouseLeave(() => {
        setHoveredLine(null);
      });

      editor.onMouseDown((e) => {
        if (role !== "teacher") return;
        const target = e.target;
        if (
          target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
          target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
        ) {
          const line = target.position?.lineNumber;
          if (!line) return;

          setLockedLines((currentLockedLines) => {
            const updated = new Set(currentLockedLines);
            if (updated.has(line)) {
              updated.delete(line);
            } else {
              updated.add(line);
            }
            return updated;
          });
        }
      });

      setIsEditorReady(true);
    },
    [editorRef, role] // Simplified dependencies for mounting
  );

  // Cleanup listener on component unmount
  useEffect(() => {
    return () => {
      if (contentChangeListener.current) {
        contentChangeListener.current.dispose();
      }
    };
  }, []);

  // useEffect for applying decorations
  useEffect(() => {
    if (!isEditorReady || !editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const decorations = [];

    // Add decorations for locked lines
    Array.from(lockedLines).forEach((line) => {
      // Basic check to ensure line number is valid
      if (line > 0 && line <= editor.getModel().getLineCount()) {
        decorations.push({
          range: new monaco.Range(line, 1, line, 1),
          options: {
            glyphMarginClassName: "lockedLineGlyph",
            glyphMarginHoverMessage: { value: "Locked line" },
            isWholeLine: true,
            className: "locked-line-highlight",
          },
        });
      }
    });

    // Add hover decoration
    if (hoveredLine && !lockedLines.has(hoveredLine)) {
      decorations.push({
        range: new monaco.Range(hoveredLine, 1, hoveredLine, 1),
        options: {
          glyphMarginClassName: "hoverGlyph",
          isWholeLine: false,
        },
      });
    }

    const newDecorationIds = editor.deltaDecorations(decorIds, decorations);
    setDecorIds(newDecorationIds);
  }, [isEditorReady, lockedLines, hoveredLine, editorRef]);

  // useEffect for injecting styles
  useEffect(() => {
    const styleId = "monaco-editor-glyph-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
       .monaco-editor .lockedLineGlyph { background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23d9480f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>') no-repeat center center; background-size: 14px; cursor: pointer; }
       .monaco-editor .locked-line-highlight { background-color: rgba(217, 72, 15, 0.2); }
       .monaco-editor .hoverGlyph { background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>') no-repeat center center; background-size: 14px; cursor: pointer; opacity: 0.6; }
     `;
    document.head.appendChild(style);
    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  // Code completion
  useEffect(() => {
    if (!monaco || !editorRef.current) return;
    let provider;

    if (true) {
      // ─── Java provider ───────────────────────────────────────────────
      if (language === "java") {
        provider = monaco.languages.registerCompletionItemProvider("java", {
          triggerCharacters: ["."],
          provideCompletionItems: (model, position) => {
            const suggestions = [];
            const text = model.getValue();
            const allSuggestions = new Set(); // Global set to prevent ALL duplicates

            // 1) Build instance → class map
            const instMap = {};

            // Fixed regex patterns for better space handling
            const genRe = /\b(\w+)\s*<[^>]+>\s+(\w+)\s*=\s*new\s+\1/g;
            const simpRe = /\b(\w+)\s+(\w+)\s*=\s*[^;]+/g;

            let m;
            while ((m = genRe.exec(text))) {
              instMap[m[2]] = m[1]; // Map instance to class
            }
            while ((m = simpRe.exec(text))) {
              // Avoid mapping keywords as classes
              if (!javaKeywords.includes(m[1])) {
                instMap[m[2]] = m[1];
              }
            }

            // 2) Are we after a dot?
            const line = model
              .getLineContent(position.lineNumber)
              .slice(0, position.column - 1);
            const dotMatch = /(\w+)\s*\.$/.exec(line); // Allow spaces before dot

            if (dotMatch) {
              // 3) Suggest methods for the instance
              const instName = dotMatch[1];
              const cls = instMap[instName] || "";
              const methods = javaLibMethods[cls] || [];

              methods.forEach((fn) => {
                const suggestionKey = `method_${fn}`;
                if (!allSuggestions.has(suggestionKey)) {
                  allSuggestions.add(suggestionKey);
                  suggestions.push({
                    label: fn,
                    kind: monaco.languages.CompletionItemKind.Method,
                    insertText: `${fn}($0)`,
                    insertTextRules:
                      monaco.languages.CompletionItemInsertTextRule
                        .InsertAsSnippet,
                    documentation: `${cls}.${fn}()`,
                  });
                }
              });
              return { suggestions };
            }

            // 4) Otherwise: keywords first
            const prefix = model.getWordUntilPosition(position).word;

            javaKeywords
              .filter((k) => k.startsWith(prefix) && k !== prefix)
              .forEach((k) => {
                const suggestionKey = `keyword_${k}`;
                if (!allSuggestions.has(suggestionKey)) {
                  allSuggestions.add(suggestionKey);
                  suggestions.push({
                    label: k,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: k,
                  });
                }
              });

            // 5) Variables and classes
            const keys = [
              ...Object.keys(instMap),
              ...Object.keys(javaLibMethods),
              ...extraJavaClasses,
            ];

            keys
              .filter((w) => w.startsWith(prefix) && w !== prefix)
              .forEach((w) => {
                const isVar = instMap[w] !== undefined;
                const isClass = javaLibMethods[w] !== undefined;

                // Create unique key based on type and name
                let suggestionKey;
                let kind;

                if (isVar) {
                  suggestionKey = `var_${w}`;
                  kind = monaco.languages.CompletionItemKind.Variable;
                } else if (isClass) {
                  suggestionKey = `class_${w}`;
                  kind = monaco.languages.CompletionItemKind.Class;
                } else {
                  suggestionKey = `module_${w}`;
                  kind = monaco.languages.CompletionItemKind.Module;
                }

                if (!allSuggestions.has(suggestionKey)) {
                  allSuggestions.add(suggestionKey);
                  suggestions.push({
                    label: w,
                    kind: kind,
                    insertText: w,
                  });
                }
              });

            return { suggestions };
          },
        });
      }

      // ─── Python provider ─────────────────────────────────────────────
      else if (language === "python") {
        provider = monaco.languages.registerCompletionItemProvider("python", {
          triggerCharacters: ["."],
          provideCompletionItems: (model, position) => {
            const suggestions = [];
            const text = model.getValue();

            // 1) Build instance → type map from various assignment patterns
            const instMap = {};

            const patterns = [
              // Standard constructor: x = ClassName(...)
              /\b(\w+)\s*=\s*([A-Za-z_]\w*)\s*\(/g,
              // Module import usage: x = module.ClassName(...)
              /\b(\w+)\s*=\s*\w+\.([A-Za-z_]\w*)\s*\(/g,
              // List/dict comprehensions and built-ins: x = [...]
              /\b(\w+)\s*=\s*\[/g, // For lists
              /\b(\w+)\s*=\s*\{/g, // For dicts/sets
              // String literals: x = "..." or x = '...'
              /\b(\w+)\s*=\s*["']/g,
              // Numeric literals: x = 123
              /\b(\w+)\s*=\s*\d+/g,
              // Function calls without parentheses captured: x = some_function
              /\b(\w+)\s*=\s*([A-Za-z_]\w*)(?!\s*\()/g,
            ];

            // Apply patterns to build instance map
            patterns.forEach((pattern, index) => {
              let match;
              const regex = new RegExp(pattern.source, pattern.flags);
              while ((match = regex.exec(text))) {
                if (match[1] && match[2]) {
                  instMap[match[1]] = match[2];
                } else if (match[1]) {
                  // For patterns that don't capture a type, infer common types
                  switch (index) {
                    case 2:
                      instMap[match[1]] = "list";
                      break;
                    case 3:
                      instMap[match[1]] = "dict";
                      break;
                    case 4:
                      instMap[match[1]] = "str";
                      break;
                    case 5:
                      instMap[match[1]] = "int";
                      break;
                  }
                }
              }
            });

            // 2) Dot context?
            const line = model
              .getLineContent(position.lineNumber)
              .slice(0, position.column - 1);
            const dotMatch = /(\w+)\.$/.exec(line);

            if (dotMatch) {
              // 3) Only methods for that instance or module
              const instName = dotMatch[1];
              let methods = [];

              // class-based methods
              if (instMap[instName] && pythonLibMethods[instMap[instName]]) {
                methods = pythonLibMethods[instMap[instName]];
              }
              // module-based functions (e.g. math, random…)
              else if (pythonLibMethods[instName]) {
                methods = pythonLibMethods[instName];
              }

              // Deduplicate methods
              const uniqueMethods = [...new Set(methods)];

              uniqueMethods.forEach((fn) => {
                suggestions.push({
                  label: fn,
                  kind: monaco.languages.CompletionItemKind.Method,
                  insertText: `${fn}($0)`,
                  insertTextRules:
                    monaco.languages.CompletionItemInsertTextRule
                      .InsertAsSnippet,
                  documentation: `${instName}.${fn}()`,
                });
              });
              return { suggestions };
            }

            // 4) Otherwise: keywords first
            const prefix = model.getWordUntilPosition(position).word;

            // Filter and deduplicate keywords
            const filteredKeywords = [
              ...new Set(
                pythonKeywords.filter(
                  (k) => k.startsWith(prefix) && k !== prefix
                )
              ),
            ];

            filteredKeywords.forEach((k) =>
              suggestions.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: k,
              })
            );

            // 5) then variables
            const filteredVars = [
              ...new Set(
                Object.keys(instMap).filter(
                  (v) => v.startsWith(prefix) && v !== prefix
                )
              ),
            ];

            filteredVars.forEach((v) =>
              suggestions.push({
                label: v,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: v,
              })
            );

            // 6) then modules and classes
            const allModulesAndClasses = [
              ...extraPythonModules,
              ...Object.keys(pythonLibMethods),
            ];

            const filteredModules = [
              ...new Set(
                allModulesAndClasses.filter(
                  (mo) => mo.startsWith(prefix) && mo !== prefix
                )
              ),
            ];

            filteredModules.forEach((mo) => {
              const isModule = extraPythonModules.includes(mo);
              suggestions.push({
                label: mo,
                kind: isModule
                  ? monaco.languages.CompletionItemKind.Module
                  : monaco.languages.CompletionItemKind.Class,
                insertText: mo,
              });
            });

            return { suggestions };
          },
        });
      }
    }

    // locks ui -----------------------------
  }, [monaco, editorRef.current, language]);

  return (
    <Editor
      height={height || "100%"}
      width={"100%"}
      language={language}
      theme="vs-dark"
      defaultValue={starterCode || ""}
      onMount={handleEditorMount}
      scrollbar={{
        className: "custom-scrollbar", // Your custom class name
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 15,
        lineNumbers: "on",
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: true,
        wordWrap: "on",
        readOnly: isDisabled,
        scrollbar: {
          vertical: "invisible",
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          verticalScrollbarSize: 12,
        },
      }}
    />
  );
}
