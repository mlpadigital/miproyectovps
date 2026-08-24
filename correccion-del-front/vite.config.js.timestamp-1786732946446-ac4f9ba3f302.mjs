// vite.config.js
import path3 from "node:path";
import react from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { createLogger, defineConfig } from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/vite/dist/node/index.js";

// plugins/visual-editor/vite-plugin-react-inline-editor.js
import path2 from "path";
import { parse as parse2 } from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@babel/parser/lib/index.js";
import traverseBabel2 from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@babel/traverse/lib/index.js";
import * as t from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@babel/types/lib/index.js";
import fs2 from "fs";

// plugins/utils/ast-utils.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import generate from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@babel/generator/lib/index.js";
import { parse } from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@babel/parser/lib/index.js";
import traverseBabel from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@babel/traverse/lib/index.js";
import {
  isJSXIdentifier,
  isJSXMemberExpression
} from "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/node_modules/@babel/types/lib/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/plugins/utils/ast-utils.js";
var __filename = fileURLToPath(__vite_injected_original_import_meta_url);
var __dirname2 = path.dirname(__filename);
var VITE_PROJECT_ROOT = path.resolve(__dirname2, "../..");
function validateFilePath(filePath) {
  if (!filePath) {
    return { isValid: false, error: "Missing filePath" };
  }
  const absoluteFilePath = path.resolve(VITE_PROJECT_ROOT, filePath);
  if (filePath.includes("..") || !absoluteFilePath.startsWith(VITE_PROJECT_ROOT) || absoluteFilePath.includes("node_modules")) {
    return { isValid: false, error: "Invalid path" };
  }
  if (!fs.existsSync(absoluteFilePath)) {
    return { isValid: false, error: "File not found" };
  }
  return { isValid: true, absolutePath: absoluteFilePath };
}
function parseFileToAST(absoluteFilePath) {
  const content = fs.readFileSync(absoluteFilePath, "utf-8");
  return parse(content, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
    errorRecovery: true
  });
}
function findJSXElementAtPosition(ast, line, column) {
  let targetNodePath = null;
  let closestNodePath = null;
  let closestDistance = Infinity;
  const allNodesOnLine = [];
  const visitor = {
    JSXOpeningElement(path4) {
      const node = path4.node;
      if (node.loc) {
        if (node.loc.start.line === line && Math.abs(node.loc.start.column - column) <= 1) {
          targetNodePath = path4;
          path4.stop();
          return;
        }
        if (node.loc.start.line === line) {
          allNodesOnLine.push({
            path: path4,
            column: node.loc.start.column,
            distance: Math.abs(node.loc.start.column - column)
          });
        }
        if (node.loc.start.line === line) {
          const distance = Math.abs(node.loc.start.column - column);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestNodePath = path4;
          }
        }
      }
    },
    // Also check JSXElement nodes that contain the position
    JSXElement(path4) {
      var _a;
      const node = path4.node;
      if (!node.loc) {
        return;
      }
      if (node.loc.start.line > line || node.loc.end.line < line) {
        return;
      }
      if (!((_a = path4.node.openingElement) == null ? void 0 : _a.loc)) {
        return;
      }
      const openingLine = path4.node.openingElement.loc.start.line;
      const openingCol = path4.node.openingElement.loc.start.column;
      if (openingLine === line) {
        const distance = Math.abs(openingCol - column);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNodePath = path4.get("openingElement");
        }
        return;
      }
      if (openingLine < line) {
        const distance = (line - openingLine) * 100;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestNodePath = path4.get("openingElement");
        }
      }
    }
  };
  traverseBabel.default(ast, visitor);
  const threshold = closestDistance < 100 ? 50 : 500;
  return targetNodePath || (closestDistance <= threshold ? closestNodePath : null);
}
function generateCode(node, options = {}) {
  const generateFunction = generate.default || generate;
  const output = generateFunction(node, options);
  return output.code;
}
function generateSourceWithMap(ast, sourceFileName, originalCode) {
  const generateFunction = generate.default || generate;
  return generateFunction(ast, {
    sourceMaps: true,
    sourceFileName
  }, originalCode);
}

// plugins/visual-editor/vite-plugin-react-inline-editor.js
var EDITABLE_HTML_TAGS = ["a", "Button", "button", "p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "label", "Label", "img"];
function parseEditId(editId) {
  const parts = editId.split(":");
  if (parts.length < 3) {
    return null;
  }
  const column = parseInt(parts.at(-1), 10);
  const line = parseInt(parts.at(-2), 10);
  const filePath = parts.slice(0, -2).join(":");
  if (!filePath || isNaN(line) || isNaN(column)) {
    return null;
  }
  return { filePath, line, column };
}
function checkTagNameEditable(openingElementNode, editableTagsList) {
  if (!openingElementNode || !openingElementNode.name)
    return false;
  const nameNode = openingElementNode.name;
  if (nameNode.type === "JSXIdentifier" && editableTagsList.includes(nameNode.name)) {
    return true;
  }
  if (nameNode.type === "JSXMemberExpression" && nameNode.property && nameNode.property.type === "JSXIdentifier" && editableTagsList.includes(nameNode.property.name)) {
    return true;
  }
  return false;
}
function validateImageSrc(openingNode) {
  if (!openingNode || !openingNode.name || openingNode.name.name !== "img") {
    return { isValid: true, reason: null };
  }
  const hasPropsSpread = openingNode.attributes.some(
    (attr) => t.isJSXSpreadAttribute(attr) && attr.argument && t.isIdentifier(attr.argument) && attr.argument.name === "props"
  );
  if (hasPropsSpread) {
    return { isValid: false, reason: "props-spread" };
  }
  const srcAttr = openingNode.attributes.find(
    (attr) => t.isJSXAttribute(attr) && attr.name && attr.name.name === "src"
  );
  if (!srcAttr) {
    return { isValid: false, reason: "missing-src" };
  }
  if (!t.isStringLiteral(srcAttr.value)) {
    return { isValid: false, reason: "dynamic-src" };
  }
  if (!srcAttr.value.value || srcAttr.value.value.trim() === "") {
    return { isValid: false, reason: "empty-src" };
  }
  return { isValid: true, reason: null };
}
function inlineEditPlugin() {
  return {
    name: "vite-inline-edit-plugin",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(jsx|tsx)$/.test(id) || !id.startsWith(VITE_PROJECT_ROOT) || id.includes("node_modules")) {
        return null;
      }
      const relativeFilePath = path2.relative(VITE_PROJECT_ROOT, id);
      const webRelativeFilePath = relativeFilePath.split(path2.sep).join("/");
      try {
        const babelAst = parse2(code, {
          sourceType: "module",
          plugins: ["jsx", "typescript"],
          errorRecovery: true
        });
        let attributesAdded = 0;
        traverseBabel2.default(babelAst, {
          enter(path4) {
            if (path4.isJSXOpeningElement()) {
              const openingNode = path4.node;
              const elementNode = path4.parentPath.node;
              if (!openingNode.loc) {
                return;
              }
              const alreadyHasId = openingNode.attributes.some(
                (attr) => t.isJSXAttribute(attr) && attr.name.name === "data-edit-id"
              );
              if (alreadyHasId) {
                return;
              }
              const isCurrentElementEditable = checkTagNameEditable(openingNode, EDITABLE_HTML_TAGS);
              if (!isCurrentElementEditable) {
                return;
              }
              const imageValidation = validateImageSrc(openingNode);
              if (!imageValidation.isValid) {
                const disabledAttribute = t.jsxAttribute(
                  t.jsxIdentifier("data-edit-disabled"),
                  t.stringLiteral("true")
                );
                openingNode.attributes.push(disabledAttribute);
                attributesAdded++;
                return;
              }
              let shouldBeDisabledDueToChildren = false;
              if (t.isJSXElement(elementNode) && elementNode.children) {
                const hasPropsSpread = openingNode.attributes.some(
                  (attr) => t.isJSXSpreadAttribute(attr) && attr.argument && t.isIdentifier(attr.argument) && attr.argument.name === "props"
                );
                const hasDynamicChild = elementNode.children.some(
                  (child) => t.isJSXExpressionContainer(child)
                );
                if (hasDynamicChild || hasPropsSpread) {
                  shouldBeDisabledDueToChildren = true;
                }
              }
              if (!shouldBeDisabledDueToChildren && t.isJSXElement(elementNode) && elementNode.children) {
                const hasEditableJsxChild = elementNode.children.some((child) => {
                  if (t.isJSXElement(child)) {
                    return checkTagNameEditable(child.openingElement, EDITABLE_HTML_TAGS);
                  }
                  return false;
                });
                if (hasEditableJsxChild) {
                  shouldBeDisabledDueToChildren = true;
                }
              }
              if (shouldBeDisabledDueToChildren) {
                const disabledAttribute = t.jsxAttribute(
                  t.jsxIdentifier("data-edit-disabled"),
                  t.stringLiteral("true")
                );
                openingNode.attributes.push(disabledAttribute);
                attributesAdded++;
                return;
              }
              if (t.isJSXElement(elementNode) && elementNode.children && elementNode.children.length > 0) {
                let hasNonEditableJsxChild = false;
                for (const child of elementNode.children) {
                  if (t.isJSXElement(child)) {
                    if (!checkTagNameEditable(child.openingElement, EDITABLE_HTML_TAGS)) {
                      hasNonEditableJsxChild = true;
                      break;
                    }
                  }
                }
                if (hasNonEditableJsxChild) {
                  const disabledAttribute = t.jsxAttribute(
                    t.jsxIdentifier("data-edit-disabled"),
                    t.stringLiteral("true")
                  );
                  openingNode.attributes.push(disabledAttribute);
                  attributesAdded++;
                  return;
                }
              }
              let currentAncestorCandidatePath = path4.parentPath.parentPath;
              while (currentAncestorCandidatePath) {
                const ancestorJsxElementPath = currentAncestorCandidatePath.isJSXElement() ? currentAncestorCandidatePath : currentAncestorCandidatePath.findParent((p) => p.isJSXElement());
                if (!ancestorJsxElementPath) {
                  break;
                }
                if (checkTagNameEditable(ancestorJsxElementPath.node.openingElement, EDITABLE_HTML_TAGS)) {
                  return;
                }
                currentAncestorCandidatePath = ancestorJsxElementPath.parentPath;
              }
              const line = openingNode.loc.start.line;
              const column = openingNode.loc.start.column + 1;
              const editId = `${webRelativeFilePath}:${line}:${column}`;
              const idAttribute = t.jsxAttribute(
                t.jsxIdentifier("data-edit-id"),
                t.stringLiteral(editId)
              );
              openingNode.attributes.push(idAttribute);
              attributesAdded++;
            }
          }
        });
        if (attributesAdded > 0) {
          const output = generateSourceWithMap(babelAst, webRelativeFilePath, code);
          return { code: output.code, map: output.map };
        }
        return null;
      } catch (error) {
        console.error(`[vite][visual-editor] Error transforming ${id}:`, error);
        return null;
      }
    },
    // Updates source code based on the changes received from the client
    configureServer(server) {
      server.middlewares.use("/api/apply-edit", async (req, res, next) => {
        if (req.method !== "POST")
          return next();
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          var _a;
          let absoluteFilePath = "";
          try {
            const { editId, newFullText } = JSON.parse(body);
            if (!editId || typeof newFullText === "undefined") {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Missing editId or newFullText" }));
            }
            const parsedId = parseEditId(editId);
            if (!parsedId) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Invalid editId format (filePath:line:column)" }));
            }
            const { filePath, line, column } = parsedId;
            const validation = validateFilePath(filePath);
            if (!validation.isValid) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: validation.error }));
            }
            absoluteFilePath = validation.absolutePath;
            const originalContent = fs2.readFileSync(absoluteFilePath, "utf-8");
            const babelAst = parseFileToAST(absoluteFilePath);
            const targetNodePath = findJSXElementAtPosition(babelAst, line, column + 1);
            if (!targetNodePath) {
              res.writeHead(404, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Target node not found by line/column", editId }));
            }
            const targetOpeningElement = targetNodePath.node;
            const parentElementNode = (_a = targetNodePath.parentPath) == null ? void 0 : _a.node;
            const isImageElement = targetOpeningElement.name && targetOpeningElement.name.name === "img";
            let beforeCode = "";
            let afterCode = "";
            let modified = false;
            if (isImageElement) {
              beforeCode = generateCode(targetOpeningElement);
              const srcAttr = targetOpeningElement.attributes.find(
                (attr) => t.isJSXAttribute(attr) && attr.name && attr.name.name === "src"
              );
              if (srcAttr && t.isStringLiteral(srcAttr.value)) {
                srcAttr.value = t.stringLiteral(newFullText);
                modified = true;
                afterCode = generateCode(targetOpeningElement);
              }
            } else {
              if (parentElementNode && t.isJSXElement(parentElementNode)) {
                beforeCode = generateCode(parentElementNode);
                parentElementNode.children = [];
                if (newFullText && newFullText.trim() !== "") {
                  const newTextNode = t.jsxText(newFullText);
                  parentElementNode.children.push(newTextNode);
                }
                modified = true;
                afterCode = generateCode(parentElementNode);
              }
            }
            if (!modified) {
              res.writeHead(409, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ error: "Could not apply changes to AST." }));
            }
            const webRelativeFilePath = path2.relative(VITE_PROJECT_ROOT, absoluteFilePath).split(path2.sep).join("/");
            const output = generateSourceWithMap(babelAst, webRelativeFilePath, originalContent);
            const newContent = output.code;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
              success: true,
              newFileContent: newContent,
              beforeCode,
              afterCode
            }));
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error during edit application." }));
          }
        });
      });
    }
  };
}

// plugins/visual-editor/vite-plugin-edit-mode.js
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// plugins/visual-editor/visual-editor-config.js
var EDIT_MODE_STYLES = `
	#root[data-edit-mode-enabled="true"] [data-edit-id] {
		cursor: pointer; 
		outline: 2px dashed #357DF9; 
		outline-offset: 2px;
		min-height: 1em;
	}
	#root[data-edit-mode-enabled="true"] img[data-edit-id] {
		outline-offset: -2px;
	}
	#root[data-edit-mode-enabled="true"] {
		cursor: pointer;
	}
	#root[data-edit-mode-enabled="true"] [data-edit-id]:hover {
		background-color: #357DF933;
		outline-color: #357DF9; 
	}

	@keyframes fadeInTooltip {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	#inline-editor-disabled-tooltip {
		display: none; 
		opacity: 0; 
		position: absolute;
		background-color: #1D1E20;
		color: white;
		padding: 4px 8px;
		border-radius: 8px;
		z-index: 10001;
		font-size: 14px;
		border: 1px solid #3B3D4A;
		max-width: 184px;
		text-align: center;
	}

	#inline-editor-disabled-tooltip.tooltip-active {
		display: block;
		animation: fadeInTooltip 0.2s ease-out forwards;
	}
`;

// plugins/visual-editor/vite-plugin-edit-mode.js
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/plugins/visual-editor/vite-plugin-edit-mode.js";
var __filename2 = fileURLToPath2(__vite_injected_original_import_meta_url2);
var __dirname3 = resolve(__filename2, "..");
function inlineEditDevPlugin() {
  return {
    name: "vite:inline-edit-dev",
    apply: "serve",
    transformIndexHtml() {
      const scriptPath = resolve(__dirname3, "edit-mode-script.js");
      const scriptContent = readFileSync(scriptPath, "utf-8");
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: scriptContent,
          injectTo: "body"
        },
        {
          tag: "style",
          children: EDIT_MODE_STYLES,
          injectTo: "head"
        }
      ];
    }
  };
}

// plugins/vite-plugin-iframe-route-restoration.js
function iframeRouteRestorationPlugin() {
  return {
    name: "vite:iframe-route-restoration",
    apply: "serve",
    transformIndexHtml() {
      const script = `
      const ALLOWED_PARENT_ORIGINS = [
          "https://horizons.hostinger.com",
          "https://horizons.hostinger.dev",
          "https://horizons-frontend-local.hostinger.dev",
      ];

        // Check to see if the page is in an iframe
        if (window.self !== window.top) {
          const STORAGE_KEY = 'horizons-iframe-saved-route';

          const getCurrentRoute = () => location.pathname + location.search + location.hash;

          const save = () => {
            try {
              const currentRoute = getCurrentRoute();
              sessionStorage.setItem(STORAGE_KEY, currentRoute);
              window.parent.postMessage({message: 'route-changed', route: currentRoute}, '*');
            } catch {}
          };

          const replaceHistoryState = (url) => {
            try {
              history.replaceState(null, '', url);
              window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
              return true;
            } catch {}
            return false;
          };

          const restore = () => {
            try {
              const saved = sessionStorage.getItem(STORAGE_KEY);
              if (!saved) return;

              if (!saved.startsWith('/')) {
                sessionStorage.removeItem(STORAGE_KEY);
                return;
              }

              const current = getCurrentRoute();
              if (current !== saved) {
                if (!replaceHistoryState(saved)) {
                  replaceHistoryState('/');
                }

                requestAnimationFrame(() => setTimeout(() => {
                  try {
                    const text = (document.body?.innerText || '').trim();

                    // If the restored route results in too little content, assume it is invalid and navigate home
                    if (text.length < 50) {
                      replaceHistoryState('/');
                    }
                  } catch {}
                }, 1000));
              }
            } catch {}
          };

          const originalPushState = history.pushState;
          history.pushState = function(...args) {
            originalPushState.apply(this, args);
            save();
          };

          const originalReplaceState = history.replaceState;
          history.replaceState = function(...args) {
            originalReplaceState.apply(this, args);
            save();
          };

          const getParentOrigin = () => {
              if (
                  window.location.ancestorOrigins &&
                  window.location.ancestorOrigins.length > 0
              ) {
                  return window.location.ancestorOrigins[0];
              }

              if (document.referrer) {
                  try {
                      return new URL(document.referrer).origin;
                  } catch (e) {
                      console.warn("Invalid referrer URL:", document.referrer);
                  }
              }

              return null;
          };

          window.addEventListener('popstate', save);
          window.addEventListener('hashchange', save);
          window.addEventListener("message", function (event) {
              const parentOrigin = getParentOrigin();

              if (event.data?.type === "redirect-home" && parentOrigin && ALLOWED_PARENT_ORIGINS.includes(parentOrigin)) {
                const saved = sessionStorage.getItem(STORAGE_KEY);

                if(saved && saved !== '/') {
                  replaceHistoryState('/')
                }
              }
          });

          restore();
        }
      `;
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: script,
          injectTo: "head"
        }
      ];
    }
  };
}

// plugins/selection-mode/vite-plugin-selection-mode.js
import { readFileSync as readFileSync2 } from "node:fs";
import { resolve as resolve2 } from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
var __vite_injected_original_import_meta_url3 = "file:///C:/Users/MLPADigital-Martin/Desktop/mlpadigital/correccion-del-front/correccion-del-front/plugins/selection-mode/vite-plugin-selection-mode.js";
var __filename3 = fileURLToPath3(__vite_injected_original_import_meta_url3);
var __dirname4 = resolve2(__filename3, "..");
function selectionModePlugin() {
  return {
    name: "vite:selection-mode",
    apply: "serve",
    transformIndexHtml() {
      const scriptPath = resolve2(__dirname4, "selection-mode-script.js");
      const scriptContent = readFileSync2(scriptPath, "utf-8");
      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: scriptContent,
          injectTo: "body"
        }
      ];
    }
  };
}

// vite.config.js
var __vite_injected_original_dirname = "C:\\Users\\MLPADigital-Martin\\Desktop\\mlpadigital\\correccion-del-front\\correccion-del-front";
var isDev = process.env.NODE_ENV !== "production";
var configHorizonsViteErrorHandler = `
const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (
				addedNode.nodeType === Node.ELEMENT_NODE &&
				(
					addedNode.tagName?.toLowerCase() === 'vite-error-overlay' ||
					addedNode.classList?.contains('backdrop')
				)
			) {
				handleViteOverlay(addedNode);
			}
		}
	}
});

observer.observe(document.documentElement, {
	childList: true,
	subtree: true
});

function handleViteOverlay(node) {
	if (!node.shadowRoot) {
		return;
	}

	const backdrop = node.shadowRoot.querySelector('.backdrop');

	if (backdrop) {
		const overlayHtml = backdrop.outerHTML;
		const parser = new DOMParser();
		const doc = parser.parseFromString(overlayHtml, 'text/html');
		const messageBodyElement = doc.querySelector('.message-body');
		const fileElement = doc.querySelector('.file');
		const messageText = messageBodyElement ? messageBodyElement.textContent.trim() : '';
		const fileText = fileElement ? fileElement.textContent.trim() : '';
		const error = messageText + (fileText ? ' File:' + fileText : '');

		window.parent.postMessage({
			type: 'horizons-vite-error',
			error,
		}, '*');
	}
}
`;
var configHorizonsRuntimeErrorHandler = `
window.onerror = (message, source, lineno, colno, errorObj) => {
	const errorDetails = errorObj ? JSON.stringify({
		name: errorObj.name,
		message: errorObj.message,
		stack: errorObj.stack,
		source,
		lineno,
		colno,
	}) : null;

	window.parent.postMessage({
		type: 'horizons-runtime-error',
		message,
		error: errorDetails
	}, '*');
};
`;
var configHorizonsConsoleErrroHandler = `
const originalConsoleError = console.error;
console.error = function(...args) {
	originalConsoleError.apply(console, args);

	let errorString = '';

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg instanceof Error) {
			errorString = arg.stack || \`\${arg.name}: \${arg.message}\`;
			break;
		}
	}

	if (!errorString) {
		errorString = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
	}

	window.parent.postMessage({
		type: 'horizons-console-error',
		error: errorString
	}, '*');
};
`;
var configWindowFetchMonkeyPatch = `
const originalFetch = window.fetch;

window.fetch = function(...args) {
	const url = args[0] instanceof Request ? args[0].url : args[0];

	// Skip WebSocket URLs
	if (url.startsWith('ws:') || url.startsWith('wss:')) {
		return originalFetch.apply(this, args);
	}

	return originalFetch.apply(this, args)
		.then(async response => {
			const contentType = response.headers.get('Content-Type') || '';

			// Exclude HTML document responses
			const isDocumentResponse =
				contentType.includes('text/html') ||
				contentType.includes('application/xhtml+xml');

			if (!response.ok && !isDocumentResponse) {
					const responseClone = response.clone();
					const errorFromRes = await responseClone.text();
					const requestUrl = response.url;
					console.error(\`Fetch error from \${requestUrl}: \${errorFromRes}\`);
			}

			return response;
		})
		.catch(error => {
			if (!url.match(/.html?$/i)) {
				console.error(error);
			}

			throw error;
		});
};
`;
var configNavigationHandler = `
if (window.navigation && window.self !== window.top) {
	window.navigation.addEventListener('navigate', (event) => {
		const url = event.destination.url;

		try {
			const destinationUrl = new URL(url);
			const destinationOrigin = destinationUrl.origin;
			const currentOrigin = window.location.origin;

			if (destinationOrigin === currentOrigin) {
				return;
			}
		} catch (error) {
			return;
		}

		window.parent.postMessage({
			type: 'horizons-navigation-error',
			url,
		}, '*');
	});
}
`;
var addTransformIndexHtml = {
  name: "add-transform-index-html",
  transformIndexHtml(html) {
    const tags = [
      {
        tag: "script",
        attrs: { type: "module" },
        children: configHorizonsRuntimeErrorHandler,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configHorizonsViteErrorHandler,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configHorizonsConsoleErrroHandler,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configWindowFetchMonkeyPatch,
        injectTo: "head"
      },
      {
        tag: "script",
        attrs: { type: "module" },
        children: configNavigationHandler,
        injectTo: "head"
      }
    ];
    if (!isDev && process.env.TEMPLATE_BANNER_SCRIPT_URL && process.env.TEMPLATE_REDIRECT_URL) {
      tags.push(
        {
          tag: "script",
          attrs: {
            src: process.env.TEMPLATE_BANNER_SCRIPT_URL,
            "template-redirect-url": process.env.TEMPLATE_REDIRECT_URL
          },
          injectTo: "head"
        }
      );
    }
    return {
      html,
      tags
    };
  }
};
console.warn = () => {
};
var logger = createLogger();
var loggerError = logger.error;
logger.error = (msg, options) => {
  var _a;
  if ((_a = options == null ? void 0 : options.error) == null ? void 0 : _a.toString().includes("CssSyntaxError: [postcss]")) {
    return;
  }
  loggerError(msg, options);
};
var vite_config_default = defineConfig({
  customLogger: logger,
  esbuild: {
    keepNames: true
  },
  plugins: [
    ...isDev ? [inlineEditPlugin(), inlineEditDevPlugin(), iframeRouteRestorationPlugin(), selectionModePlugin()] : [],
    react(),
    addTransformIndexHtml
  ],
  server: {
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless"
    },
    allowedHosts: true
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts", ".json"],
    alias: {
      "@": path3.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      external: [
        "@babel/parser",
        "@babel/traverse",
        "@babel/generator",
        "@babel/types"
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLXJlYWN0LWlubGluZS1lZGl0b3IuanMiLCAicGx1Z2lucy91dGlscy9hc3QtdXRpbHMuanMiLCAicGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qcyIsICJwbHVnaW5zL3Zpc3VhbC1lZGl0b3IvdmlzdWFsLWVkaXRvci1jb25maWcuanMiLCAicGx1Z2lucy92aXRlLXBsdWdpbi1pZnJhbWUtcm91dGUtcmVzdG9yYXRpb24uanMiLCAicGx1Z2lucy9zZWxlY3Rpb24tbW9kZS92aXRlLXBsdWdpbi1zZWxlY3Rpb24tbW9kZS5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1MUEFEaWdpdGFsLU1hcnRpblxcXFxEZXNrdG9wXFxcXG1scGFkaWdpdGFsXFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXGNvcnJlY2Npb24tZGVsLWZyb250XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNTFBBRGlnaXRhbC1NYXJ0aW5cXFxcRGVza3RvcFxcXFxtbHBhZGlnaXRhbFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTUxQQURpZ2l0YWwtTWFydGluL0Rlc2t0b3AvbWxwYWRpZ2l0YWwvY29ycmVjY2lvbi1kZWwtZnJvbnQvY29ycmVjY2lvbi1kZWwtZnJvbnQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xyXG5pbXBvcnQgeyBjcmVhdGVMb2dnZXIsIGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgaW5saW5lRWRpdFBsdWdpbiBmcm9tICcuL3BsdWdpbnMvdmlzdWFsLWVkaXRvci92aXRlLXBsdWdpbi1yZWFjdC1pbmxpbmUtZWRpdG9yLmpzJztcclxuaW1wb3J0IGVkaXRNb2RlRGV2UGx1Z2luIGZyb20gJy4vcGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qcyc7XHJcbmltcG9ydCBpZnJhbWVSb3V0ZVJlc3RvcmF0aW9uUGx1Z2luIGZyb20gJy4vcGx1Z2lucy92aXRlLXBsdWdpbi1pZnJhbWUtcm91dGUtcmVzdG9yYXRpb24uanMnO1xyXG5pbXBvcnQgc2VsZWN0aW9uTW9kZVBsdWdpbiBmcm9tICcuL3BsdWdpbnMvc2VsZWN0aW9uLW1vZGUvdml0ZS1wbHVnaW4tc2VsZWN0aW9uLW1vZGUuanMnO1xyXG5cclxuY29uc3QgaXNEZXYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nO1xyXG5cclxuY29uc3QgY29uZmlnSG9yaXpvbnNWaXRlRXJyb3JIYW5kbGVyID0gYFxyXG5jb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChtdXRhdGlvbnMpID0+IHtcclxuXHRmb3IgKGNvbnN0IG11dGF0aW9uIG9mIG11dGF0aW9ucykge1xyXG5cdFx0Zm9yIChjb25zdCBhZGRlZE5vZGUgb2YgbXV0YXRpb24uYWRkZWROb2Rlcykge1xyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0YWRkZWROb2RlLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSAmJlxyXG5cdFx0XHRcdChcclxuXHRcdFx0XHRcdGFkZGVkTm9kZS50YWdOYW1lPy50b0xvd2VyQ2FzZSgpID09PSAndml0ZS1lcnJvci1vdmVybGF5JyB8fFxyXG5cdFx0XHRcdFx0YWRkZWROb2RlLmNsYXNzTGlzdD8uY29udGFpbnMoJ2JhY2tkcm9wJylcclxuXHRcdFx0XHQpXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdGhhbmRsZVZpdGVPdmVybGF5KGFkZGVkTm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG5cclxub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcclxuXHRjaGlsZExpc3Q6IHRydWUsXHJcblx0c3VidHJlZTogdHJ1ZVxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGhhbmRsZVZpdGVPdmVybGF5KG5vZGUpIHtcclxuXHRpZiAoIW5vZGUuc2hhZG93Um9vdCkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0Y29uc3QgYmFja2Ryb3AgPSBub2RlLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLmJhY2tkcm9wJyk7XHJcblxyXG5cdGlmIChiYWNrZHJvcCkge1xyXG5cdFx0Y29uc3Qgb3ZlcmxheUh0bWwgPSBiYWNrZHJvcC5vdXRlckhUTUw7XHJcblx0XHRjb25zdCBwYXJzZXIgPSBuZXcgRE9NUGFyc2VyKCk7XHJcblx0XHRjb25zdCBkb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKG92ZXJsYXlIdG1sLCAndGV4dC9odG1sJyk7XHJcblx0XHRjb25zdCBtZXNzYWdlQm9keUVsZW1lbnQgPSBkb2MucXVlcnlTZWxlY3RvcignLm1lc3NhZ2UtYm9keScpO1xyXG5cdFx0Y29uc3QgZmlsZUVsZW1lbnQgPSBkb2MucXVlcnlTZWxlY3RvcignLmZpbGUnKTtcclxuXHRcdGNvbnN0IG1lc3NhZ2VUZXh0ID0gbWVzc2FnZUJvZHlFbGVtZW50ID8gbWVzc2FnZUJvZHlFbGVtZW50LnRleHRDb250ZW50LnRyaW0oKSA6ICcnO1xyXG5cdFx0Y29uc3QgZmlsZVRleHQgPSBmaWxlRWxlbWVudCA/IGZpbGVFbGVtZW50LnRleHRDb250ZW50LnRyaW0oKSA6ICcnO1xyXG5cdFx0Y29uc3QgZXJyb3IgPSBtZXNzYWdlVGV4dCArIChmaWxlVGV4dCA/ICcgRmlsZTonICsgZmlsZVRleHQgOiAnJyk7XHJcblxyXG5cdFx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7XHJcblx0XHRcdHR5cGU6ICdob3Jpem9ucy12aXRlLWVycm9yJyxcclxuXHRcdFx0ZXJyb3IsXHJcblx0XHR9LCAnKicpO1xyXG5cdH1cclxufVxyXG5gO1xyXG5cclxuY29uc3QgY29uZmlnSG9yaXpvbnNSdW50aW1lRXJyb3JIYW5kbGVyID0gYFxyXG53aW5kb3cub25lcnJvciA9IChtZXNzYWdlLCBzb3VyY2UsIGxpbmVubywgY29sbm8sIGVycm9yT2JqKSA9PiB7XHJcblx0Y29uc3QgZXJyb3JEZXRhaWxzID0gZXJyb3JPYmogPyBKU09OLnN0cmluZ2lmeSh7XHJcblx0XHRuYW1lOiBlcnJvck9iai5uYW1lLFxyXG5cdFx0bWVzc2FnZTogZXJyb3JPYmoubWVzc2FnZSxcclxuXHRcdHN0YWNrOiBlcnJvck9iai5zdGFjayxcclxuXHRcdHNvdXJjZSxcclxuXHRcdGxpbmVubyxcclxuXHRcdGNvbG5vLFxyXG5cdH0pIDogbnVsbDtcclxuXHJcblx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7XHJcblx0XHR0eXBlOiAnaG9yaXpvbnMtcnVudGltZS1lcnJvcicsXHJcblx0XHRtZXNzYWdlLFxyXG5cdFx0ZXJyb3I6IGVycm9yRGV0YWlsc1xyXG5cdH0sICcqJyk7XHJcbn07XHJcbmA7XHJcblxyXG5jb25zdCBjb25maWdIb3Jpem9uc0NvbnNvbGVFcnJyb0hhbmRsZXIgPSBgXHJcbmNvbnN0IG9yaWdpbmFsQ29uc29sZUVycm9yID0gY29uc29sZS5lcnJvcjtcclxuY29uc29sZS5lcnJvciA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcclxuXHRvcmlnaW5hbENvbnNvbGVFcnJvci5hcHBseShjb25zb2xlLCBhcmdzKTtcclxuXHJcblx0bGV0IGVycm9yU3RyaW5nID0gJyc7XHJcblxyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG5cdFx0Y29uc3QgYXJnID0gYXJnc1tpXTtcclxuXHRcdGlmIChhcmcgaW5zdGFuY2VvZiBFcnJvcikge1xyXG5cdFx0XHRlcnJvclN0cmluZyA9IGFyZy5zdGFjayB8fCBcXGBcXCR7YXJnLm5hbWV9OiBcXCR7YXJnLm1lc3NhZ2V9XFxgO1xyXG5cdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGlmICghZXJyb3JTdHJpbmcpIHtcclxuXHRcdGVycm9yU3RyaW5nID0gYXJncy5tYXAoYXJnID0+IHR5cGVvZiBhcmcgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkoYXJnKSA6IFN0cmluZyhhcmcpKS5qb2luKCcgJyk7XHJcblx0fVxyXG5cclxuXHR3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHtcclxuXHRcdHR5cGU6ICdob3Jpem9ucy1jb25zb2xlLWVycm9yJyxcclxuXHRcdGVycm9yOiBlcnJvclN0cmluZ1xyXG5cdH0sICcqJyk7XHJcbn07XHJcbmA7XHJcblxyXG5jb25zdCBjb25maWdXaW5kb3dGZXRjaE1vbmtleVBhdGNoID0gYFxyXG5jb25zdCBvcmlnaW5hbEZldGNoID0gd2luZG93LmZldGNoO1xyXG5cclxud2luZG93LmZldGNoID0gZnVuY3Rpb24oLi4uYXJncykge1xyXG5cdGNvbnN0IHVybCA9IGFyZ3NbMF0gaW5zdGFuY2VvZiBSZXF1ZXN0ID8gYXJnc1swXS51cmwgOiBhcmdzWzBdO1xyXG5cclxuXHQvLyBTa2lwIFdlYlNvY2tldCBVUkxzXHJcblx0aWYgKHVybC5zdGFydHNXaXRoKCd3czonKSB8fCB1cmwuc3RhcnRzV2l0aCgnd3NzOicpKSB7XHJcblx0XHRyZXR1cm4gb3JpZ2luYWxGZXRjaC5hcHBseSh0aGlzLCBhcmdzKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBvcmlnaW5hbEZldGNoLmFwcGx5KHRoaXMsIGFyZ3MpXHJcblx0XHQudGhlbihhc3luYyByZXNwb25zZSA9PiB7XHJcblx0XHRcdGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpIHx8ICcnO1xyXG5cclxuXHRcdFx0Ly8gRXhjbHVkZSBIVE1MIGRvY3VtZW50IHJlc3BvbnNlc1xyXG5cdFx0XHRjb25zdCBpc0RvY3VtZW50UmVzcG9uc2UgPVxyXG5cdFx0XHRcdGNvbnRlbnRUeXBlLmluY2x1ZGVzKCd0ZXh0L2h0bWwnKSB8fFxyXG5cdFx0XHRcdGNvbnRlbnRUeXBlLmluY2x1ZGVzKCdhcHBsaWNhdGlvbi94aHRtbCt4bWwnKTtcclxuXHJcblx0XHRcdGlmICghcmVzcG9uc2Uub2sgJiYgIWlzRG9jdW1lbnRSZXNwb25zZSkge1xyXG5cdFx0XHRcdFx0Y29uc3QgcmVzcG9uc2VDbG9uZSA9IHJlc3BvbnNlLmNsb25lKCk7XHJcblx0XHRcdFx0XHRjb25zdCBlcnJvckZyb21SZXMgPSBhd2FpdCByZXNwb25zZUNsb25lLnRleHQoKTtcclxuXHRcdFx0XHRcdGNvbnN0IHJlcXVlc3RVcmwgPSByZXNwb25zZS51cmw7XHJcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFxcYEZldGNoIGVycm9yIGZyb20gXFwke3JlcXVlc3RVcmx9OiBcXCR7ZXJyb3JGcm9tUmVzfVxcYCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHJldHVybiByZXNwb25zZTtcclxuXHRcdH0pXHJcblx0XHQuY2F0Y2goZXJyb3IgPT4ge1xyXG5cdFx0XHRpZiAoIXVybC5tYXRjaCgvXFwuaHRtbD8kL2kpKSB7XHJcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlcnJvcik7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHRocm93IGVycm9yO1xyXG5cdFx0fSk7XHJcbn07XHJcbmA7XHJcblxyXG5jb25zdCBjb25maWdOYXZpZ2F0aW9uSGFuZGxlciA9IGBcclxuaWYgKHdpbmRvdy5uYXZpZ2F0aW9uICYmIHdpbmRvdy5zZWxmICE9PSB3aW5kb3cudG9wKSB7XHJcblx0d2luZG93Lm5hdmlnYXRpb24uYWRkRXZlbnRMaXN0ZW5lcignbmF2aWdhdGUnLCAoZXZlbnQpID0+IHtcclxuXHRcdGNvbnN0IHVybCA9IGV2ZW50LmRlc3RpbmF0aW9uLnVybDtcclxuXHJcblx0XHR0cnkge1xyXG5cdFx0XHRjb25zdCBkZXN0aW5hdGlvblVybCA9IG5ldyBVUkwodXJsKTtcclxuXHRcdFx0Y29uc3QgZGVzdGluYXRpb25PcmlnaW4gPSBkZXN0aW5hdGlvblVybC5vcmlnaW47XHJcblx0XHRcdGNvbnN0IGN1cnJlbnRPcmlnaW4gPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luO1xyXG5cclxuXHRcdFx0aWYgKGRlc3RpbmF0aW9uT3JpZ2luID09PSBjdXJyZW50T3JpZ2luKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0d2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSh7XHJcblx0XHRcdHR5cGU6ICdob3Jpem9ucy1uYXZpZ2F0aW9uLWVycm9yJyxcclxuXHRcdFx0dXJsLFxyXG5cdFx0fSwgJyonKTtcclxuXHR9KTtcclxufVxyXG5gO1xyXG5cclxuY29uc3QgYWRkVHJhbnNmb3JtSW5kZXhIdG1sID0ge1xyXG5cdG5hbWU6ICdhZGQtdHJhbnNmb3JtLWluZGV4LWh0bWwnLFxyXG5cdHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XHJcblx0XHRjb25zdCB0YWdzID0gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGFnOiAnc2NyaXB0JyxcclxuXHRcdFx0XHRhdHRyczogeyB0eXBlOiAnbW9kdWxlJyB9LFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBjb25maWdIb3Jpem9uc1J1bnRpbWVFcnJvckhhbmRsZXIsXHJcblx0XHRcdFx0aW5qZWN0VG86ICdoZWFkJyxcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRhZzogJ3NjcmlwdCcsXHJcblx0XHRcdFx0YXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcclxuXHRcdFx0XHRjaGlsZHJlbjogY29uZmlnSG9yaXpvbnNWaXRlRXJyb3JIYW5kbGVyLFxyXG5cdFx0XHRcdGluamVjdFRvOiAnaGVhZCcsXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxyXG5cdFx0XHRcdGF0dHJzOiB7dHlwZTogJ21vZHVsZSd9LFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBjb25maWdIb3Jpem9uc0NvbnNvbGVFcnJyb0hhbmRsZXIsXHJcblx0XHRcdFx0aW5qZWN0VG86ICdoZWFkJyxcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRhZzogJ3NjcmlwdCcsXHJcblx0XHRcdFx0YXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcclxuXHRcdFx0XHRjaGlsZHJlbjogY29uZmlnV2luZG93RmV0Y2hNb25rZXlQYXRjaCxcclxuXHRcdFx0XHRpbmplY3RUbzogJ2hlYWQnLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGFnOiAnc2NyaXB0JyxcclxuXHRcdFx0XHRhdHRyczogeyB0eXBlOiAnbW9kdWxlJyB9LFxyXG5cdFx0XHRcdGNoaWxkcmVuOiBjb25maWdOYXZpZ2F0aW9uSGFuZGxlcixcclxuXHRcdFx0XHRpbmplY3RUbzogJ2hlYWQnLFxyXG5cdFx0XHR9LFxyXG5cdFx0XTtcclxuXHJcblx0XHRpZiAoIWlzRGV2ICYmIHByb2Nlc3MuZW52LlRFTVBMQVRFX0JBTk5FUl9TQ1JJUFRfVVJMICYmIHByb2Nlc3MuZW52LlRFTVBMQVRFX1JFRElSRUNUX1VSTCkge1xyXG5cdFx0XHR0YWdzLnB1c2goXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dGFnOiAnc2NyaXB0JyxcclxuXHRcdFx0XHRcdGF0dHJzOiB7XHJcblx0XHRcdFx0XHRcdHNyYzogcHJvY2Vzcy5lbnYuVEVNUExBVEVfQkFOTkVSX1NDUklQVF9VUkwsXHJcblx0XHRcdFx0XHRcdCd0ZW1wbGF0ZS1yZWRpcmVjdC11cmwnOiBwcm9jZXNzLmVudi5URU1QTEFURV9SRURJUkVDVF9VUkwsXHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0aW5qZWN0VG86ICdoZWFkJyxcclxuXHRcdFx0XHR9XHJcblx0XHRcdCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0aHRtbCxcclxuXHRcdFx0dGFncyxcclxuXHRcdH07XHJcblx0fSxcclxufTtcclxuXHJcbmNvbnNvbGUud2FybiA9ICgpID0+IHt9O1xyXG5cclxuY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKClcclxuY29uc3QgbG9nZ2VyRXJyb3IgPSBsb2dnZXIuZXJyb3JcclxuXHJcbmxvZ2dlci5lcnJvciA9IChtc2csIG9wdGlvbnMpID0+IHtcclxuXHRpZiAob3B0aW9ucz8uZXJyb3I/LnRvU3RyaW5nKCkuaW5jbHVkZXMoJ0Nzc1N5bnRheEVycm9yOiBbcG9zdGNzc10nKSkge1xyXG5cdFx0cmV0dXJuO1xyXG5cdH1cclxuXHJcblx0bG9nZ2VyRXJyb3IobXNnLCBvcHRpb25zKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuXHRjdXN0b21Mb2dnZXI6IGxvZ2dlcixcclxuXHRlc2J1aWxkOiB7XHJcblx0XHRrZWVwTmFtZXM6IHRydWVcclxuXHR9LFxyXG5cdHBsdWdpbnM6IFtcclxuXHRcdC4uLihpc0RldiA/IFtpbmxpbmVFZGl0UGx1Z2luKCksIGVkaXRNb2RlRGV2UGx1Z2luKCksIGlmcmFtZVJvdXRlUmVzdG9yYXRpb25QbHVnaW4oKSwgc2VsZWN0aW9uTW9kZVBsdWdpbigpXSA6IFtdKSxcclxuXHRcdHJlYWN0KCksXHJcblx0XHRhZGRUcmFuc2Zvcm1JbmRleEh0bWxcclxuXHRdLFxyXG5cdHNlcnZlcjoge1xyXG5cdFx0Y29yczogdHJ1ZSxcclxuXHRcdGhlYWRlcnM6IHtcclxuXHRcdFx0J0Nyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3knOiAnY3JlZGVudGlhbGxlc3MnLFxyXG5cdFx0fSxcclxuXHRcdGFsbG93ZWRIb3N0czogdHJ1ZSxcclxuXHR9LFxyXG5cdHJlc29sdmU6IHtcclxuXHRcdGV4dGVuc2lvbnM6IFsnLmpzeCcsICcuanMnLCAnLnRzeCcsICcudHMnLCAnLmpzb24nLCBdLFxyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0J0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHRidWlsZDoge1xyXG5cdFx0cm9sbHVwT3B0aW9uczoge1xyXG5cdFx0XHRleHRlcm5hbDogW1xyXG5cdFx0XHRcdCdAYmFiZWwvcGFyc2VyJyxcclxuXHRcdFx0XHQnQGJhYmVsL3RyYXZlcnNlJyxcclxuXHRcdFx0XHQnQGJhYmVsL2dlbmVyYXRvcicsXHJcblx0XHRcdFx0J0BiYWJlbC90eXBlcydcclxuXHRcdFx0XVxyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTUxQQURpZ2l0YWwtTWFydGluXFxcXERlc2t0b3BcXFxcbWxwYWRpZ2l0YWxcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxccGx1Z2luc1xcXFx2aXN1YWwtZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNTFBBRGlnaXRhbC1NYXJ0aW5cXFxcRGVza3RvcFxcXFxtbHBhZGlnaXRhbFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxwbHVnaW5zXFxcXHZpc3VhbC1lZGl0b3JcXFxcdml0ZS1wbHVnaW4tcmVhY3QtaW5saW5lLWVkaXRvci5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTUxQQURpZ2l0YWwtTWFydGluL0Rlc2t0b3AvbWxwYWRpZ2l0YWwvY29ycmVjY2lvbi1kZWwtZnJvbnQvY29ycmVjY2lvbi1kZWwtZnJvbnQvcGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLXJlYWN0LWlubGluZS1lZGl0b3IuanNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICdAYmFiZWwvcGFyc2VyJztcclxuaW1wb3J0IHRyYXZlcnNlQmFiZWwgZnJvbSAnQGJhYmVsL3RyYXZlcnNlJztcclxuaW1wb3J0ICogYXMgdCBmcm9tICdAYmFiZWwvdHlwZXMnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBcclxuXHR2YWxpZGF0ZUZpbGVQYXRoLCBcclxuXHRwYXJzZUZpbGVUb0FTVCwgXHJcblx0ZmluZEpTWEVsZW1lbnRBdFBvc2l0aW9uLFxyXG5cdGdlbmVyYXRlQ29kZSxcclxuXHRnZW5lcmF0ZVNvdXJjZVdpdGhNYXAsXHJcblx0VklURV9QUk9KRUNUX1JPT1RcclxufSBmcm9tICcuLi91dGlscy9hc3QtdXRpbHMuanMnO1xyXG5cclxuY29uc3QgRURJVEFCTEVfSFRNTF9UQUdTID0gW1wiYVwiLCBcIkJ1dHRvblwiLCBcImJ1dHRvblwiLCBcInBcIiwgXCJzcGFuXCIsIFwiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcImg2XCIsIFwibGFiZWxcIiwgXCJMYWJlbFwiLCBcImltZ1wiXTtcclxuXHJcbmZ1bmN0aW9uIHBhcnNlRWRpdElkKGVkaXRJZCkge1xyXG5cdGNvbnN0IHBhcnRzID0gZWRpdElkLnNwbGl0KCc6Jyk7XHJcblxyXG5cdGlmIChwYXJ0cy5sZW5ndGggPCAzKSB7XHJcblx0XHRyZXR1cm4gbnVsbDtcclxuXHR9XHJcblxyXG5cdGNvbnN0IGNvbHVtbiA9IHBhcnNlSW50KHBhcnRzLmF0KC0xKSwgMTApO1xyXG5cdGNvbnN0IGxpbmUgPSBwYXJzZUludChwYXJ0cy5hdCgtMiksIDEwKTtcclxuXHRjb25zdCBmaWxlUGF0aCA9IHBhcnRzLnNsaWNlKDAsIC0yKS5qb2luKCc6Jyk7XHJcblxyXG5cdGlmICghZmlsZVBhdGggfHwgaXNOYU4obGluZSkgfHwgaXNOYU4oY29sdW1uKSkge1xyXG5cdFx0cmV0dXJuIG51bGw7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4geyBmaWxlUGF0aCwgbGluZSwgY29sdW1uIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNoZWNrVGFnTmFtZUVkaXRhYmxlKG9wZW5pbmdFbGVtZW50Tm9kZSwgZWRpdGFibGVUYWdzTGlzdCkge1xyXG5cdGlmICghb3BlbmluZ0VsZW1lbnROb2RlIHx8ICFvcGVuaW5nRWxlbWVudE5vZGUubmFtZSkgcmV0dXJuIGZhbHNlO1xyXG5cdGNvbnN0IG5hbWVOb2RlID0gb3BlbmluZ0VsZW1lbnROb2RlLm5hbWU7XHJcblxyXG5cdC8vIENoZWNrIDE6IERpcmVjdCBuYW1lIChmb3IgPHA+LCA8QnV0dG9uPilcclxuXHRpZiAobmFtZU5vZGUudHlwZSA9PT0gJ0pTWElkZW50aWZpZXInICYmIGVkaXRhYmxlVGFnc0xpc3QuaW5jbHVkZXMobmFtZU5vZGUubmFtZSkpIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0Ly8gQ2hlY2sgMjogUHJvcGVydHkgbmFtZSBvZiBhIG1lbWJlciBleHByZXNzaW9uIChmb3IgPG1vdGlvbi5oMT4sIGNoZWNrIGlmIFwiaDFcIiBpcyBpbiBlZGl0YWJsZVRhZ3NMaXN0KVxyXG5cdGlmIChuYW1lTm9kZS50eXBlID09PSAnSlNYTWVtYmVyRXhwcmVzc2lvbicgJiYgbmFtZU5vZGUucHJvcGVydHkgJiYgbmFtZU5vZGUucHJvcGVydHkudHlwZSA9PT0gJ0pTWElkZW50aWZpZXInICYmIGVkaXRhYmxlVGFnc0xpc3QuaW5jbHVkZXMobmFtZU5vZGUucHJvcGVydHkubmFtZSkpIHtcclxuXHRcdHJldHVybiB0cnVlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUltYWdlU3JjKG9wZW5pbmdOb2RlKSB7XHJcblx0aWYgKCFvcGVuaW5nTm9kZSB8fCAhb3BlbmluZ05vZGUubmFtZSB8fCBvcGVuaW5nTm9kZS5uYW1lLm5hbWUgIT09ICdpbWcnKSB7XHJcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiB0cnVlLCByZWFzb246IG51bGwgfTsgLy8gTm90IGFuIGltYWdlLCBza2lwIHZhbGlkYXRpb25cclxuXHR9XHJcblxyXG5cdGNvbnN0IGhhc1Byb3BzU3ByZWFkID0gb3BlbmluZ05vZGUuYXR0cmlidXRlcy5zb21lKGF0dHIgPT5cclxuXHRcdHQuaXNKU1hTcHJlYWRBdHRyaWJ1dGUoYXR0cikgJiZcclxuXHRcdGF0dHIuYXJndW1lbnQgJiZcclxuXHRcdHQuaXNJZGVudGlmaWVyKGF0dHIuYXJndW1lbnQpICYmXHJcblx0XHRhdHRyLmFyZ3VtZW50Lm5hbWUgPT09ICdwcm9wcydcclxuXHQpO1xyXG5cclxuXHRpZiAoaGFzUHJvcHNTcHJlYWQpIHtcclxuXHRcdHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCByZWFzb246ICdwcm9wcy1zcHJlYWQnIH07XHJcblx0fVxyXG5cclxuXHRjb25zdCBzcmNBdHRyID0gb3BlbmluZ05vZGUuYXR0cmlidXRlcy5maW5kKGF0dHIgPT5cclxuXHRcdHQuaXNKU1hBdHRyaWJ1dGUoYXR0cikgJiZcclxuXHRcdGF0dHIubmFtZSAmJlxyXG5cdFx0YXR0ci5uYW1lLm5hbWUgPT09ICdzcmMnXHJcblx0KTtcclxuXHJcblx0aWYgKCFzcmNBdHRyKSB7XHJcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgcmVhc29uOiAnbWlzc2luZy1zcmMnIH07XHJcblx0fVxyXG5cclxuXHRpZiAoIXQuaXNTdHJpbmdMaXRlcmFsKHNyY0F0dHIudmFsdWUpKSB7XHJcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgcmVhc29uOiAnZHluYW1pYy1zcmMnIH07XHJcblx0fVxyXG5cclxuXHRpZiAoIXNyY0F0dHIudmFsdWUudmFsdWUgfHwgc3JjQXR0ci52YWx1ZS52YWx1ZS50cmltKCkgPT09ICcnKSB7XHJcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgcmVhc29uOiAnZW1wdHktc3JjJyB9O1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHsgaXNWYWxpZDogdHJ1ZSwgcmVhc29uOiBudWxsIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlubGluZUVkaXRQbHVnaW4oKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdG5hbWU6ICd2aXRlLWlubGluZS1lZGl0LXBsdWdpbicsXHJcblx0XHRlbmZvcmNlOiAncHJlJyxcclxuXHJcblx0XHR0cmFuc2Zvcm0oY29kZSwgaWQpIHtcclxuXHRcdFx0aWYgKCEvXFwuKGpzeHx0c3gpJC8udGVzdChpZCkgfHwgIWlkLnN0YXJ0c1dpdGgoVklURV9QUk9KRUNUX1JPT1QpIHx8IGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG5cdFx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb25zdCByZWxhdGl2ZUZpbGVQYXRoID0gcGF0aC5yZWxhdGl2ZShWSVRFX1BST0pFQ1RfUk9PVCwgaWQpO1xyXG5cdFx0XHRjb25zdCB3ZWJSZWxhdGl2ZUZpbGVQYXRoID0gcmVsYXRpdmVGaWxlUGF0aC5zcGxpdChwYXRoLnNlcCkuam9pbignLycpO1xyXG5cclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb25zdCBiYWJlbEFzdCA9IHBhcnNlKGNvZGUsIHtcclxuXHRcdFx0XHRcdHNvdXJjZVR5cGU6ICdtb2R1bGUnLFxyXG5cdFx0XHRcdFx0cGx1Z2luczogWydqc3gnLCAndHlwZXNjcmlwdCddLFxyXG5cdFx0XHRcdFx0ZXJyb3JSZWNvdmVyeTogdHJ1ZVxyXG5cdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRsZXQgYXR0cmlidXRlc0FkZGVkID0gMDtcclxuXHJcblx0XHRcdFx0dHJhdmVyc2VCYWJlbC5kZWZhdWx0KGJhYmVsQXN0LCB7XHJcblx0XHRcdFx0XHRlbnRlcihwYXRoKSB7XHJcblx0XHRcdFx0XHRcdGlmIChwYXRoLmlzSlNYT3BlbmluZ0VsZW1lbnQoKSkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9wZW5pbmdOb2RlID0gcGF0aC5ub2RlO1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGVsZW1lbnROb2RlID0gcGF0aC5wYXJlbnRQYXRoLm5vZGU7IC8vIFRoZSBKU1hFbGVtZW50IGl0c2VsZlxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIW9wZW5pbmdOb2RlLmxvYykge1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgYWxyZWFkeUhhc0lkID0gb3BlbmluZ05vZGUuYXR0cmlidXRlcy5zb21lKFxyXG5cdFx0XHRcdFx0XHRcdFx0KGF0dHIpID0+IHQuaXNKU1hBdHRyaWJ1dGUoYXR0cikgJiYgYXR0ci5uYW1lLm5hbWUgPT09ICdkYXRhLWVkaXQtaWQnXHJcblx0XHRcdFx0XHRcdFx0KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0aWYgKGFscmVhZHlIYXNJZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Ly8gQ29uZGl0aW9uIDE6IElzIHRoZSBjdXJyZW50IGVsZW1lbnQgdGFnIHR5cGUgZWRpdGFibGU/XHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXNDdXJyZW50RWxlbWVudEVkaXRhYmxlID0gY2hlY2tUYWdOYW1lRWRpdGFibGUob3BlbmluZ05vZGUsIEVESVRBQkxFX0hUTUxfVEFHUyk7XHJcblx0XHRcdFx0XHRcdFx0aWYgKCFpc0N1cnJlbnRFbGVtZW50RWRpdGFibGUpIHtcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGltYWdlVmFsaWRhdGlvbiA9IHZhbGlkYXRlSW1hZ2VTcmMob3BlbmluZ05vZGUpO1xyXG5cdFx0XHRcdFx0XHRcdGlmICghaW1hZ2VWYWxpZGF0aW9uLmlzVmFsaWQpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRpc2FibGVkQXR0cmlidXRlID0gdC5qc3hBdHRyaWJ1dGUoXHJcblx0XHRcdFx0XHRcdFx0XHRcdHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWRpc2FibGVkJyksXHJcblx0XHRcdFx0XHRcdFx0XHRcdHQuc3RyaW5nTGl0ZXJhbCgndHJ1ZScpXHJcblx0XHRcdFx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdFx0XHRcdFx0b3BlbmluZ05vZGUuYXR0cmlidXRlcy5wdXNoKGRpc2FibGVkQXR0cmlidXRlKTtcclxuXHRcdFx0XHRcdFx0XHRcdGF0dHJpYnV0ZXNBZGRlZCsrO1xyXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0bGV0IHNob3VsZEJlRGlzYWJsZWREdWVUb0NoaWxkcmVuID0gZmFsc2U7XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIENvbmRpdGlvbiAyOiBEb2VzIHRoZSBlbGVtZW50IGhhdmUgZHluYW1pYyBvciBlZGl0YWJsZSBjaGlsZHJlblxyXG5cdFx0XHRcdFx0XHRcdGlmICh0LmlzSlNYRWxlbWVudChlbGVtZW50Tm9kZSkgJiYgZWxlbWVudE5vZGUuY2hpbGRyZW4pIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIGVsZW1lbnQgaGFzIHsuLi5wcm9wc30gc3ByZWFkIGF0dHJpYnV0ZSAtIGRpc2FibGUgZWRpdGluZyBpZiBpdCBkb2VzXHJcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBoYXNQcm9wc1NwcmVhZCA9IG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMuc29tZShhdHRyID0+IHQuaXNKU1hTcHJlYWRBdHRyaWJ1dGUoYXR0cilcclxuXHRcdFx0XHRcdFx0XHRcdFx0JiYgYXR0ci5hcmd1bWVudFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQmJiB0LmlzSWRlbnRpZmllcihhdHRyLmFyZ3VtZW50KVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQmJiBhdHRyLmFyZ3VtZW50Lm5hbWUgPT09ICdwcm9wcydcclxuXHRcdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgaGFzRHluYW1pY0NoaWxkID0gZWxlbWVudE5vZGUuY2hpbGRyZW4uc29tZShjaGlsZCA9PlxyXG5cdFx0XHRcdFx0XHRcdFx0XHR0LmlzSlNYRXhwcmVzc2lvbkNvbnRhaW5lcihjaGlsZClcclxuXHRcdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGhhc0R5bmFtaWNDaGlsZCB8fCBoYXNQcm9wc1NwcmVhZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRzaG91bGRCZURpc2FibGVkRHVlVG9DaGlsZHJlbiA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoIXNob3VsZEJlRGlzYWJsZWREdWVUb0NoaWxkcmVuICYmIHQuaXNKU1hFbGVtZW50KGVsZW1lbnROb2RlKSAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgaGFzRWRpdGFibGVKc3hDaGlsZCA9IGVsZW1lbnROb2RlLmNoaWxkcmVuLnNvbWUoY2hpbGQgPT4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodC5pc0pTWEVsZW1lbnQoY2hpbGQpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGNoZWNrVGFnTmFtZUVkaXRhYmxlKGNoaWxkLm9wZW5pbmdFbGVtZW50LCBFRElUQUJMRV9IVE1MX1RBR1MpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdFx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoaGFzRWRpdGFibGVKc3hDaGlsZCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRzaG91bGRCZURpc2FibGVkRHVlVG9DaGlsZHJlbiA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHRpZiAoc2hvdWxkQmVEaXNhYmxlZER1ZVRvQ2hpbGRyZW4pIHtcclxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRpc2FibGVkQXR0cmlidXRlID0gdC5qc3hBdHRyaWJ1dGUoXHJcblx0XHRcdFx0XHRcdFx0XHRcdHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWRpc2FibGVkJyksXHJcblx0XHRcdFx0XHRcdFx0XHRcdHQuc3RyaW5nTGl0ZXJhbCgndHJ1ZScpXHJcblx0XHRcdFx0XHRcdFx0XHQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMucHVzaChkaXNhYmxlZEF0dHJpYnV0ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRhdHRyaWJ1dGVzQWRkZWQrKztcclxuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdC8vIENvbmRpdGlvbiAzOiBQYXJlbnQgaXMgbm9uLWVkaXRhYmxlIGlmIEFUIExFQVNUIE9ORSBjaGlsZCBKU1hFbGVtZW50IGlzIGEgbm9uLWVkaXRhYmxlIHR5cGUuXHJcblx0XHRcdFx0XHRcdFx0aWYgKHQuaXNKU1hFbGVtZW50KGVsZW1lbnROb2RlKSAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbiAmJiBlbGVtZW50Tm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRsZXQgaGFzTm9uRWRpdGFibGVKc3hDaGlsZCA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBjaGlsZCBvZiBlbGVtZW50Tm9kZS5jaGlsZHJlbikge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodC5pc0pTWEVsZW1lbnQoY2hpbGQpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFjaGVja1RhZ05hbWVFZGl0YWJsZShjaGlsZC5vcGVuaW5nRWxlbWVudCwgRURJVEFCTEVfSFRNTF9UQUdTKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aGFzTm9uRWRpdGFibGVKc3hDaGlsZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcdGlmIChoYXNOb25FZGl0YWJsZUpzeENoaWxkKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRpc2FibGVkQXR0cmlidXRlID0gdC5qc3hBdHRyaWJ1dGUoXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0dC5qc3hJZGVudGlmaWVyKCdkYXRhLWVkaXQtZGlzYWJsZWQnKSxcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0LnN0cmluZ0xpdGVyYWwoXCJ0cnVlXCIpXHJcblx0XHRcdFx0XHRcdFx0XHRcdCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMucHVzaChkaXNhYmxlZEF0dHJpYnV0ZSk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdGF0dHJpYnV0ZXNBZGRlZCsrO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0XHQvLyBDb25kaXRpb24gNDogSXMgYW55IGFuY2VzdG9yIEpTWEVsZW1lbnQgYWxzbyBlZGl0YWJsZT9cclxuXHRcdFx0XHRcdFx0XHRsZXQgY3VycmVudEFuY2VzdG9yQ2FuZGlkYXRlUGF0aCA9IHBhdGgucGFyZW50UGF0aC5wYXJlbnRQYXRoO1xyXG5cdFx0XHRcdFx0XHRcdHdoaWxlIChjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhbmNlc3RvckpzeEVsZW1lbnRQYXRoID0gY3VycmVudEFuY2VzdG9yQ2FuZGlkYXRlUGF0aC5pc0pTWEVsZW1lbnQoKVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IGN1cnJlbnRBbmNlc3RvckNhbmRpZGF0ZVBhdGhcclxuXHRcdFx0XHRcdFx0XHRcdFx0OiBjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoLmZpbmRQYXJlbnQocCA9PiBwLmlzSlNYRWxlbWVudCgpKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0XHRpZiAoIWFuY2VzdG9ySnN4RWxlbWVudFBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0aWYgKGNoZWNrVGFnTmFtZUVkaXRhYmxlKGFuY2VzdG9ySnN4RWxlbWVudFBhdGgubm9kZS5vcGVuaW5nRWxlbWVudCwgRURJVEFCTEVfSFRNTF9UQUdTKSkge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRjdXJyZW50QW5jZXN0b3JDYW5kaWRhdGVQYXRoID0gYW5jZXN0b3JKc3hFbGVtZW50UGF0aC5wYXJlbnRQYXRoO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgbGluZSA9IG9wZW5pbmdOb2RlLmxvYy5zdGFydC5saW5lO1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNvbHVtbiA9IG9wZW5pbmdOb2RlLmxvYy5zdGFydC5jb2x1bW4gKyAxO1xyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGVkaXRJZCA9IGAke3dlYlJlbGF0aXZlRmlsZVBhdGh9OiR7bGluZX06JHtjb2x1bW59YDtcclxuXHJcblx0XHRcdFx0XHRcdFx0Y29uc3QgaWRBdHRyaWJ1dGUgPSB0LmpzeEF0dHJpYnV0ZShcclxuXHRcdFx0XHRcdFx0XHRcdHQuanN4SWRlbnRpZmllcignZGF0YS1lZGl0LWlkJyksXHJcblx0XHRcdFx0XHRcdFx0XHR0LnN0cmluZ0xpdGVyYWwoZWRpdElkKVxyXG5cdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdG9wZW5pbmdOb2RlLmF0dHJpYnV0ZXMucHVzaChpZEF0dHJpYnV0ZSk7XHJcblx0XHRcdFx0XHRcdFx0YXR0cmlidXRlc0FkZGVkKys7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0aWYgKGF0dHJpYnV0ZXNBZGRlZCA+IDApIHtcclxuXHRcdFx0XHRcdGNvbnN0IG91dHB1dCA9IGdlbmVyYXRlU291cmNlV2l0aE1hcChiYWJlbEFzdCwgd2ViUmVsYXRpdmVGaWxlUGF0aCwgY29kZSk7XHJcblx0XHRcdFx0XHRyZXR1cm4geyBjb2RlOiBvdXRwdXQuY29kZSwgbWFwOiBvdXRwdXQubWFwIH07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKGBbdml0ZV1bdmlzdWFsLWVkaXRvcl0gRXJyb3IgdHJhbnNmb3JtaW5nICR7aWR9OmAsIGVycm9yKTtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fSxcclxuXHJcblxyXG5cdFx0Ly8gVXBkYXRlcyBzb3VyY2UgY29kZSBiYXNlZCBvbiB0aGUgY2hhbmdlcyByZWNlaXZlZCBmcm9tIHRoZSBjbGllbnRcclxuXHRcdGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuXHRcdFx0c2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9hcHBseS1lZGl0JywgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcblx0XHRcdFx0aWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykgcmV0dXJuIG5leHQoKTtcclxuXHJcblx0XHRcdFx0bGV0IGJvZHkgPSAnJztcclxuXHRcdFx0XHRyZXEub24oJ2RhdGEnLCBjaHVuayA9PiB7IGJvZHkgKz0gY2h1bmsudG9TdHJpbmcoKTsgfSk7XHJcblxyXG5cdFx0XHRcdHJlcS5vbignZW5kJywgYXN5bmMgKCkgPT4ge1xyXG5cdFx0XHRcdFx0bGV0IGFic29sdXRlRmlsZVBhdGggPSAnJztcclxuXHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHsgZWRpdElkLCBuZXdGdWxsVGV4dCB9ID0gSlNPTi5wYXJzZShib2R5KTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghZWRpdElkIHx8IHR5cGVvZiBuZXdGdWxsVGV4dCA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDQwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdNaXNzaW5nIGVkaXRJZCBvciBuZXdGdWxsVGV4dCcgfSkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zdCBwYXJzZWRJZCA9IHBhcnNlRWRpdElkKGVkaXRJZCk7XHJcblx0XHRcdFx0XHRcdGlmICghcGFyc2VkSWQpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDQwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnZhbGlkIGVkaXRJZCBmb3JtYXQgKGZpbGVQYXRoOmxpbmU6Y29sdW1uKScgfSkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zdCB7IGZpbGVQYXRoLCBsaW5lLCBjb2x1bW4gfSA9IHBhcnNlZElkO1xyXG5cclxuXHRcdFx0XHRcdFx0Ly8gVmFsaWRhdGUgZmlsZSBwYXRoXHJcblx0XHRcdFx0XHRcdGNvbnN0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZUZpbGVQYXRoKGZpbGVQYXRoKTtcclxuXHRcdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLmlzVmFsaWQpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDQwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6IHZhbGlkYXRpb24uZXJyb3IgfSkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdGFic29sdXRlRmlsZVBhdGggPSB2YWxpZGF0aW9uLmFic29sdXRlUGF0aDtcclxuXHJcblx0XHRcdFx0XHRcdC8vIFBhcnNlIEFTVFxyXG5cdFx0XHRcdFx0XHRjb25zdCBvcmlnaW5hbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoYWJzb2x1dGVGaWxlUGF0aCwgJ3V0Zi04Jyk7XHJcblx0XHRcdFx0XHRcdGNvbnN0IGJhYmVsQXN0ID0gcGFyc2VGaWxlVG9BU1QoYWJzb2x1dGVGaWxlUGF0aCk7XHJcblxyXG5cdFx0XHRcdFx0XHQvLyBGaW5kIHRhcmdldCBub2RlIChub3RlOiBhcHBseS1lZGl0IHVzZXMgY29sdW1uKzEpXHJcblx0XHRcdFx0XHRcdGNvbnN0IHRhcmdldE5vZGVQYXRoID0gZmluZEpTWEVsZW1lbnRBdFBvc2l0aW9uKGJhYmVsQXN0LCBsaW5lLCBjb2x1bW4gKyAxKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghdGFyZ2V0Tm9kZVBhdGgpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDQwNCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdUYXJnZXQgbm9kZSBub3QgZm91bmQgYnkgbGluZS9jb2x1bW4nLCBlZGl0SWQgfSkpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRPcGVuaW5nRWxlbWVudCA9IHRhcmdldE5vZGVQYXRoLm5vZGU7XHJcblx0XHRcdFx0XHRcdGNvbnN0IHBhcmVudEVsZW1lbnROb2RlID0gdGFyZ2V0Tm9kZVBhdGgucGFyZW50UGF0aD8ubm9kZTtcclxuXHJcblx0XHRcdFx0XHRcdGNvbnN0IGlzSW1hZ2VFbGVtZW50ID0gdGFyZ2V0T3BlbmluZ0VsZW1lbnQubmFtZSAmJiB0YXJnZXRPcGVuaW5nRWxlbWVudC5uYW1lLm5hbWUgPT09ICdpbWcnO1xyXG5cclxuXHRcdFx0XHRcdFx0bGV0IGJlZm9yZUNvZGUgPSAnJztcclxuXHRcdFx0XHRcdFx0bGV0IGFmdGVyQ29kZSA9ICcnO1xyXG5cdFx0XHRcdFx0XHRsZXQgbW9kaWZpZWQgPSBmYWxzZTtcclxuXHJcblx0XHRcdFx0XHRcdGlmIChpc0ltYWdlRWxlbWVudCkge1xyXG5cdFx0XHRcdFx0XHRcdC8vIEhhbmRsZSBpbWFnZSBzcmMgYXR0cmlidXRlIHVwZGF0ZVxyXG5cdFx0XHRcdFx0XHRcdGJlZm9yZUNvZGUgPSBnZW5lcmF0ZUNvZGUodGFyZ2V0T3BlbmluZ0VsZW1lbnQpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRjb25zdCBzcmNBdHRyID0gdGFyZ2V0T3BlbmluZ0VsZW1lbnQuYXR0cmlidXRlcy5maW5kKGF0dHIgPT5cclxuXHRcdFx0XHRcdFx0XHRcdHQuaXNKU1hBdHRyaWJ1dGUoYXR0cikgJiYgYXR0ci5uYW1lICYmIGF0dHIubmFtZS5uYW1lID09PSAnc3JjJ1xyXG5cdFx0XHRcdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdGlmIChzcmNBdHRyICYmIHQuaXNTdHJpbmdMaXRlcmFsKHNyY0F0dHIudmFsdWUpKSB7XHJcblx0XHRcdFx0XHRcdFx0XHRzcmNBdHRyLnZhbHVlID0gdC5zdHJpbmdMaXRlcmFsKG5ld0Z1bGxUZXh0KTtcclxuXHRcdFx0XHRcdFx0XHRcdG1vZGlmaWVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRcdGFmdGVyQ29kZSA9IGdlbmVyYXRlQ29kZSh0YXJnZXRPcGVuaW5nRWxlbWVudCk7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRFbGVtZW50Tm9kZSAmJiB0LmlzSlNYRWxlbWVudChwYXJlbnRFbGVtZW50Tm9kZSkpIHtcclxuXHRcdFx0XHRcdFx0XHRcdGJlZm9yZUNvZGUgPSBnZW5lcmF0ZUNvZGUocGFyZW50RWxlbWVudE5vZGUpO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnROb2RlLmNoaWxkcmVuID0gW107XHJcblx0XHRcdFx0XHRcdFx0XHRpZiAobmV3RnVsbFRleHQgJiYgbmV3RnVsbFRleHQudHJpbSgpICE9PSAnJykge1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBuZXdUZXh0Tm9kZSA9IHQuanN4VGV4dChuZXdGdWxsVGV4dCk7XHJcblx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudEVsZW1lbnROb2RlLmNoaWxkcmVuLnB1c2gobmV3VGV4dE5vZGUpO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFx0bW9kaWZpZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0YWZ0ZXJDb2RlID0gZ2VuZXJhdGVDb2RlKHBhcmVudEVsZW1lbnROb2RlKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGlmICghbW9kaWZpZWQpIHtcclxuXHRcdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDQwOSwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdDb3VsZCBub3QgYXBwbHkgY2hhbmdlcyB0byBBU1QuJyB9KSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRcdGNvbnN0IHdlYlJlbGF0aXZlRmlsZVBhdGggPSBwYXRoLnJlbGF0aXZlKFZJVEVfUFJPSkVDVF9ST09ULCBhYnNvbHV0ZUZpbGVQYXRoKS5zcGxpdChwYXRoLnNlcCkuam9pbignLycpO1xyXG5cdFx0XHRcdFx0XHRjb25zdCBvdXRwdXQgPSBnZW5lcmF0ZVNvdXJjZVdpdGhNYXAoYmFiZWxBc3QsIHdlYlJlbGF0aXZlRmlsZVBhdGgsIG9yaWdpbmFsQ29udGVudCk7XHJcblx0XHRcdFx0XHRcdGNvbnN0IG5ld0NvbnRlbnQgPSBvdXRwdXQuY29kZTtcclxuXHJcblx0XHRcdFx0XHRcdHJlcy53cml0ZUhlYWQoMjAwLCB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XHJcblx0XHRcdFx0XHRcdHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHRcdFx0XHRcdHN1Y2Nlc3M6IHRydWUsXHJcblx0XHRcdFx0XHRcdFx0bmV3RmlsZUNvbnRlbnQ6IG5ld0NvbnRlbnQsXHJcblx0XHRcdFx0XHRcdFx0YmVmb3JlQ29kZSxcclxuXHRcdFx0XHRcdFx0XHRhZnRlckNvZGUsXHJcblx0XHRcdFx0XHRcdH0pKTtcclxuXHJcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0XHRcdFx0XHRyZXMud3JpdGVIZWFkKDUwMCwgeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0pO1xyXG5cdFx0XHRcdFx0XHRyZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgZXJyb3I6ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3IgZHVyaW5nIGVkaXQgYXBwbGljYXRpb24uJyB9KSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH07XHJcbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1MUEFEaWdpdGFsLU1hcnRpblxcXFxEZXNrdG9wXFxcXG1scGFkaWdpdGFsXFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXHBsdWdpbnNcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1MUEFEaWdpdGFsLU1hcnRpblxcXFxEZXNrdG9wXFxcXG1scGFkaWdpdGFsXFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXHBsdWdpbnNcXFxcdXRpbHNcXFxcYXN0LXV0aWxzLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9NTFBBRGlnaXRhbC1NYXJ0aW4vRGVza3RvcC9tbHBhZGlnaXRhbC9jb3JyZWNjaW9uLWRlbC1mcm9udC9jb3JyZWNjaW9uLWRlbC1mcm9udC9wbHVnaW5zL3V0aWxzL2FzdC11dGlscy5qc1wiO2ltcG9ydCBmcyBmcm9tICdub2RlOmZzJztcclxuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcclxuaW1wb3J0IGdlbmVyYXRlIGZyb20gJ0BiYWJlbC9nZW5lcmF0b3InO1xyXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gJ0BiYWJlbC9wYXJzZXInO1xyXG5pbXBvcnQgdHJhdmVyc2VCYWJlbCBmcm9tICdAYmFiZWwvdHJhdmVyc2UnO1xyXG5pbXBvcnQge1xyXG5cdGlzSlNYSWRlbnRpZmllcixcclxuXHRpc0pTWE1lbWJlckV4cHJlc3Npb24sXHJcbn0gZnJvbSAnQGJhYmVsL3R5cGVzJztcclxuXHJcbmNvbnN0IF9fZmlsZW5hbWUgPSBmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCk7XHJcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShfX2ZpbGVuYW1lKTtcclxuY29uc3QgVklURV9QUk9KRUNUX1JPT1QgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4nKTtcclxuXHJcbi8vIEJsYWNrbGlzdCBvZiBjb21wb25lbnRzIHRoYXQgc2hvdWxkIG5vdCBiZSBleHRyYWN0ZWQgKHV0aWxpdHkvbm9uLXZpc3VhbCBjb21wb25lbnRzKVxyXG5jb25zdCBDT01QT05FTlRfQkxBQ0tMSVNUID0gbmV3IFNldChbXHJcblx0J0hlbG1ldCcsXHJcblx0J0hlbG1ldFByb3ZpZGVyJyxcclxuXHQnSGVhZCcsXHJcblx0J2hlYWQnLFxyXG5cdCdNZXRhJyxcclxuXHQnbWV0YScsXHJcblx0J1NjcmlwdCcsXHJcblx0J3NjcmlwdCcsXHJcblx0J05vU2NyaXB0JyxcclxuXHQnbm9zY3JpcHQnLFxyXG5cdCdTdHlsZScsXHJcblx0J3N0eWxlJyxcclxuXHQndGl0bGUnLFxyXG5cdCdUaXRsZScsXHJcblx0J2xpbmsnLFxyXG5cdCdMaW5rJyxcclxuXSk7XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIHRoYXQgYSBmaWxlIHBhdGggaXMgc2FmZSB0byBhY2Nlc3NcclxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gUmVsYXRpdmUgZmlsZSBwYXRoXHJcbiAqIEByZXR1cm5zIHt7IGlzVmFsaWQ6IGJvb2xlYW4sIGFic29sdXRlUGF0aD86IHN0cmluZywgZXJyb3I/OiBzdHJpbmcgfX0gLSBPYmplY3QgY29udGFpbmluZyB2YWxpZGF0aW9uIHJlc3VsdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsZVBhdGgoZmlsZVBhdGgpIHtcclxuXHRpZiAoIWZpbGVQYXRoKSB7XHJcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdNaXNzaW5nIGZpbGVQYXRoJyB9O1xyXG5cdH1cclxuXHJcblx0Y29uc3QgYWJzb2x1dGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShWSVRFX1BST0pFQ1RfUk9PVCwgZmlsZVBhdGgpO1xyXG5cclxuXHRpZiAoZmlsZVBhdGguaW5jbHVkZXMoJy4uJylcclxuXHRcdHx8ICFhYnNvbHV0ZUZpbGVQYXRoLnN0YXJ0c1dpdGgoVklURV9QUk9KRUNUX1JPT1QpXHJcblx0XHR8fCBhYnNvbHV0ZUZpbGVQYXRoLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG5cdFx0cmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9yOiAnSW52YWxpZCBwYXRoJyB9O1xyXG5cdH1cclxuXHJcblx0aWYgKCFmcy5leGlzdHNTeW5jKGFic29sdXRlRmlsZVBhdGgpKSB7XHJcblx0XHRyZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3I6ICdGaWxlIG5vdCBmb3VuZCcgfTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7IGlzVmFsaWQ6IHRydWUsIGFic29sdXRlUGF0aDogYWJzb2x1dGVGaWxlUGF0aCB9O1xyXG59XHJcblxyXG4vKipcclxuICogUGFyc2VzIGEgZmlsZSBpbnRvIGEgQmFiZWwgQVNUXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBhYnNvbHV0ZUZpbGVQYXRoIC0gQWJzb2x1dGUgcGF0aCB0byBmaWxlXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IEJhYmVsIEFTVFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmlsZVRvQVNUKGFic29sdXRlRmlsZVBhdGgpIHtcclxuXHRjb25zdCBjb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGFic29sdXRlRmlsZVBhdGgsICd1dGYtOCcpO1xyXG5cclxuXHRyZXR1cm4gcGFyc2UoY29udGVudCwge1xyXG5cdFx0c291cmNlVHlwZTogJ21vZHVsZScsXHJcblx0XHRwbHVnaW5zOiBbJ2pzeCcsICd0eXBlc2NyaXB0J10sXHJcblx0XHRlcnJvclJlY292ZXJ5OiB0cnVlLFxyXG5cdH0pO1xyXG59XHJcblxyXG4vKipcclxuICogRmluZHMgYSBKU1ggb3BlbmluZyBlbGVtZW50IGF0IGEgc3BlY2lmaWMgbGluZSBhbmQgY29sdW1uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhc3QgLSBCYWJlbCBBU1RcclxuICogQHBhcmFtIHtudW1iZXJ9IGxpbmUgLSBMaW5lIG51bWJlciAoMS1pbmRleGVkKVxyXG4gKiBAcGFyYW0ge251bWJlcn0gY29sdW1uIC0gQ29sdW1uIG51bWJlciAoMC1pbmRleGVkIGZvciBnZXQtY29kZS1ibG9jaywgMS1pbmRleGVkIGZvciBhcHBseS1lZGl0KVxyXG4gKiBAcmV0dXJucyB7b2JqZWN0IHwgbnVsbH0gQmFiZWwgcGF0aCB0byB0aGUgSlNYIG9wZW5pbmcgZWxlbWVudFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRKU1hFbGVtZW50QXRQb3NpdGlvbihhc3QsIGxpbmUsIGNvbHVtbikge1xyXG5cdGxldCB0YXJnZXROb2RlUGF0aCA9IG51bGw7XHJcblx0bGV0IGNsb3Nlc3ROb2RlUGF0aCA9IG51bGw7XHJcblx0bGV0IGNsb3Nlc3REaXN0YW5jZSA9IEluZmluaXR5O1xyXG5cdGNvbnN0IGFsbE5vZGVzT25MaW5lID0gW107XHJcblxyXG5cdGNvbnN0IHZpc2l0b3IgPSB7XHJcblx0XHRKU1hPcGVuaW5nRWxlbWVudChwYXRoKSB7XHJcblx0XHRcdGNvbnN0IG5vZGUgPSBwYXRoLm5vZGU7XHJcblx0XHRcdGlmIChub2RlLmxvYykge1xyXG5cdFx0XHRcdC8vIEV4YWN0IG1hdGNoICh3aXRoIHRvbGVyYW5jZSBmb3Igb2ZmLWJ5LW9uZSBjb2x1bW4gZGlmZmVyZW5jZXMpXHJcblx0XHRcdFx0aWYgKG5vZGUubG9jLnN0YXJ0LmxpbmUgPT09IGxpbmVcclxuXHRcdFx0XHRcdCYmIE1hdGguYWJzKG5vZGUubG9jLnN0YXJ0LmNvbHVtbiAtIGNvbHVtbikgPD0gMSkge1xyXG5cdFx0XHRcdFx0dGFyZ2V0Tm9kZVBhdGggPSBwYXRoO1xyXG5cdFx0XHRcdFx0cGF0aC5zdG9wKCk7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBUcmFjayBhbGwgbm9kZXMgb24gdGhlIHNhbWUgbGluZVxyXG5cdFx0XHRcdGlmIChub2RlLmxvYy5zdGFydC5saW5lID09PSBsaW5lKSB7XHJcblx0XHRcdFx0XHRhbGxOb2Rlc09uTGluZS5wdXNoKHtcclxuXHRcdFx0XHRcdFx0cGF0aCxcclxuXHRcdFx0XHRcdFx0Y29sdW1uOiBub2RlLmxvYy5zdGFydC5jb2x1bW4sXHJcblx0XHRcdFx0XHRcdGRpc3RhbmNlOiBNYXRoLmFicyhub2RlLmxvYy5zdGFydC5jb2x1bW4gLSBjb2x1bW4pLFxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQvLyBUcmFjayBjbG9zZXN0IG1hdGNoIG9uIHRoZSBzYW1lIGxpbmUgZm9yIGZhbGxiYWNrXHJcblx0XHRcdFx0aWYgKG5vZGUubG9jLnN0YXJ0LmxpbmUgPT09IGxpbmUpIHtcclxuXHRcdFx0XHRcdGNvbnN0IGRpc3RhbmNlID0gTWF0aC5hYnMobm9kZS5sb2Muc3RhcnQuY29sdW1uIC0gY29sdW1uKTtcclxuXHRcdFx0XHRcdGlmIChkaXN0YW5jZSA8IGNsb3Nlc3REaXN0YW5jZSkge1xyXG5cdFx0XHRcdFx0XHRjbG9zZXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuXHRcdFx0XHRcdFx0Y2xvc2VzdE5vZGVQYXRoID0gcGF0aDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0sXHJcblx0XHQvLyBBbHNvIGNoZWNrIEpTWEVsZW1lbnQgbm9kZXMgdGhhdCBjb250YWluIHRoZSBwb3NpdGlvblxyXG5cdFx0SlNYRWxlbWVudChwYXRoKSB7XHJcblx0XHRcdGNvbnN0IG5vZGUgPSBwYXRoLm5vZGU7XHJcblx0XHRcdGlmICghbm9kZS5sb2MpIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIENoZWNrIGlmIHRoaXMgZWxlbWVudCBzcGFucyB0aGUgdGFyZ2V0IGxpbmUgKGZvciBtdWx0aS1saW5lIGVsZW1lbnRzKVxyXG5cdFx0XHRpZiAobm9kZS5sb2Muc3RhcnQubGluZSA+IGxpbmUgfHwgbm9kZS5sb2MuZW5kLmxpbmUgPCBsaW5lKSB7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBJZiB3ZSdyZSBpbnNpZGUgdGhpcyBlbGVtZW50J3MgcmFuZ2UsIGNvbnNpZGVyIGl0cyBvcGVuaW5nIGVsZW1lbnRcclxuXHRcdFx0aWYgKCFwYXRoLm5vZGUub3BlbmluZ0VsZW1lbnQ/LmxvYykge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y29uc3Qgb3BlbmluZ0xpbmUgPSBwYXRoLm5vZGUub3BlbmluZ0VsZW1lbnQubG9jLnN0YXJ0LmxpbmU7XHJcblx0XHRcdGNvbnN0IG9wZW5pbmdDb2wgPSBwYXRoLm5vZGUub3BlbmluZ0VsZW1lbnQubG9jLnN0YXJ0LmNvbHVtbjtcclxuXHJcblx0XHRcdC8vIFByZWZlciBlbGVtZW50cyB0aGF0IHN0YXJ0IG9uIHRoZSBleGFjdCBsaW5lXHJcblx0XHRcdGlmIChvcGVuaW5nTGluZSA9PT0gbGluZSkge1xyXG5cdFx0XHRcdGNvbnN0IGRpc3RhbmNlID0gTWF0aC5hYnMob3BlbmluZ0NvbCAtIGNvbHVtbik7XHJcblx0XHRcdFx0aWYgKGRpc3RhbmNlIDwgY2xvc2VzdERpc3RhbmNlKSB7XHJcblx0XHRcdFx0XHRjbG9zZXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcclxuXHRcdFx0XHRcdGNsb3Nlc3ROb2RlUGF0aCA9IHBhdGguZ2V0KCdvcGVuaW5nRWxlbWVudCcpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIEhhbmRsZSBlbGVtZW50cyB0aGF0IHN0YXJ0IGJlZm9yZSB0aGUgdGFyZ2V0IGxpbmVcclxuXHRcdFx0aWYgKG9wZW5pbmdMaW5lIDwgbGluZSkge1xyXG5cdFx0XHRcdGNvbnN0IGRpc3RhbmNlID0gKGxpbmUgLSBvcGVuaW5nTGluZSkgKiAxMDA7IC8vIFBlbmFsaXplIGJ5IGxpbmUgZGlzdGFuY2VcclxuXHRcdFx0XHRpZiAoZGlzdGFuY2UgPCBjbG9zZXN0RGlzdGFuY2UpIHtcclxuXHRcdFx0XHRcdGNsb3Nlc3REaXN0YW5jZSA9IGRpc3RhbmNlO1xyXG5cdFx0XHRcdFx0Y2xvc2VzdE5vZGVQYXRoID0gcGF0aC5nZXQoJ29wZW5pbmdFbGVtZW50Jyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9LFxyXG5cdH07XHJcblxyXG5cdHRyYXZlcnNlQmFiZWwuZGVmYXVsdChhc3QsIHZpc2l0b3IpO1xyXG5cclxuXHQvLyBSZXR1cm4gZXhhY3QgbWF0Y2ggaWYgZm91bmQsIG90aGVyd2lzZSByZXR1cm4gY2xvc2VzdCBtYXRjaCBpZiB3aXRoaW4gcmVhc29uYWJsZSBkaXN0YW5jZVxyXG5cdC8vIFVzZSBsYXJnZXIgdGhyZXNob2xkICg1MCBjaGFycykgZm9yIHNhbWUtbGluZSBlbGVtZW50cywgNSBsaW5lcyBmb3IgbXVsdGktbGluZSBlbGVtZW50c1xyXG5cdGNvbnN0IHRocmVzaG9sZCA9IGNsb3Nlc3REaXN0YW5jZSA8IDEwMCA/IDUwIDogNTAwO1xyXG5cdHJldHVybiB0YXJnZXROb2RlUGF0aCB8fCAoY2xvc2VzdERpc3RhbmNlIDw9IHRocmVzaG9sZCA/IGNsb3Nlc3ROb2RlUGF0aCA6IG51bGwpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2tzIGlmIGEgSlNYIGVsZW1lbnQgbmFtZSBpcyBibGFja2xpc3RlZFxyXG4gKiBAcGFyYW0ge29iamVjdH0ganN4T3BlbmluZ0VsZW1lbnQgLSBCYWJlbCBKU1ggb3BlbmluZyBlbGVtZW50IG5vZGVcclxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYmxhY2tsaXN0ZWRcclxuICovXHJcbmZ1bmN0aW9uIGlzQmxhY2tsaXN0ZWRDb21wb25lbnQoanN4T3BlbmluZ0VsZW1lbnQpIHtcclxuXHRpZiAoIWpzeE9wZW5pbmdFbGVtZW50IHx8ICFqc3hPcGVuaW5nRWxlbWVudC5uYW1lKSB7XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHQvLyBIYW5kbGUgSlNYSWRlbnRpZmllciAoZS5nLiwgPEhlbG1ldD4pXHJcblx0aWYgKGlzSlNYSWRlbnRpZmllcihqc3hPcGVuaW5nRWxlbWVudC5uYW1lKSkge1xyXG5cdFx0cmV0dXJuIENPTVBPTkVOVF9CTEFDS0xJU1QuaGFzKGpzeE9wZW5pbmdFbGVtZW50Lm5hbWUubmFtZSk7XHJcblx0fVxyXG5cclxuXHQvLyBIYW5kbGUgSlNYTWVtYmVyRXhwcmVzc2lvbiAoZS5nLiwgPFJlYWN0LkZyYWdtZW50PilcclxuXHRpZiAoaXNKU1hNZW1iZXJFeHByZXNzaW9uKGpzeE9wZW5pbmdFbGVtZW50Lm5hbWUpKSB7XHJcblx0XHRsZXQgY3VycmVudCA9IGpzeE9wZW5pbmdFbGVtZW50Lm5hbWU7XHJcblx0XHR3aGlsZSAoaXNKU1hNZW1iZXJFeHByZXNzaW9uKGN1cnJlbnQpKSB7XHJcblx0XHRcdGN1cnJlbnQgPSBjdXJyZW50LnByb3BlcnR5O1xyXG5cdFx0fVxyXG5cdFx0aWYgKGlzSlNYSWRlbnRpZmllcihjdXJyZW50KSkge1xyXG5cdFx0XHRyZXR1cm4gQ09NUE9ORU5UX0JMQUNLTElTVC5oYXMoY3VycmVudC5uYW1lKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBjb2RlIGZyb20gYW4gQVNUIG5vZGVcclxuICogQHBhcmFtIHtvYmplY3R9IG5vZGUgLSBCYWJlbCBBU1Qgbm9kZVxyXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIEdlbmVyYXRvciBvcHRpb25zXHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEdlbmVyYXRlZCBjb2RlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVDb2RlKG5vZGUsIG9wdGlvbnMgPSB7fSkge1xyXG5cdGNvbnN0IGdlbmVyYXRlRnVuY3Rpb24gPSBnZW5lcmF0ZS5kZWZhdWx0IHx8IGdlbmVyYXRlO1xyXG5cdGNvbnN0IG91dHB1dCA9IGdlbmVyYXRlRnVuY3Rpb24obm9kZSwgb3B0aW9ucyk7XHJcblx0cmV0dXJuIG91dHB1dC5jb2RlO1xyXG59XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIGEgZnVsbCBzb3VyY2UgZmlsZSBmcm9tIEFTVCB3aXRoIHNvdXJjZSBtYXBzXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBhc3QgLSBCYWJlbCBBU1RcclxuICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZUZpbGVOYW1lIC0gU291cmNlIGZpbGUgbmFtZSBmb3Igc291cmNlIG1hcFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxDb2RlIC0gT3JpZ2luYWwgc291cmNlIGNvZGVcclxuICogQHJldHVybnMge3tjb2RlOiBzdHJpbmcsIG1hcDogb2JqZWN0fX0gLSBPYmplY3QgY29udGFpbmluZyBnZW5lcmF0ZWQgY29kZSBhbmQgc291cmNlIG1hcFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlU291cmNlV2l0aE1hcChhc3QsIHNvdXJjZUZpbGVOYW1lLCBvcmlnaW5hbENvZGUpIHtcclxuXHRjb25zdCBnZW5lcmF0ZUZ1bmN0aW9uID0gZ2VuZXJhdGUuZGVmYXVsdCB8fCBnZW5lcmF0ZTtcclxuXHRyZXR1cm4gZ2VuZXJhdGVGdW5jdGlvbihhc3QsIHtcclxuXHRcdHNvdXJjZU1hcHM6IHRydWUsXHJcblx0XHRzb3VyY2VGaWxlTmFtZSxcclxuXHR9LCBvcmlnaW5hbENvZGUpO1xyXG59XHJcblxyXG4vKipcclxuICogRXh0cmFjdHMgY29kZSBibG9ja3MgZnJvbSBhIEpTWCBlbGVtZW50IGF0IGEgc3BlY2lmaWMgbG9jYXRpb25cclxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoIC0gUmVsYXRpdmUgZmlsZSBwYXRoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lIC0gTGluZSBudW1iZXJcclxuICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbiAtIENvbHVtbiBudW1iZXJcclxuICogQHBhcmFtIHtvYmplY3R9IFtkb21Db250ZXh0XSAtIE9wdGlvbmFsIERPTSBjb250ZXh0IHRvIHJldHVybiBvbiBmYWlsdXJlXHJcbiAqIEByZXR1cm5zIHt7c3VjY2VzczogYm9vbGVhbiwgZmlsZVBhdGg/OiBzdHJpbmcsIHNwZWNpZmljTGluZT86IHN0cmluZywgZXJyb3I/OiBzdHJpbmcsIGRvbUNvbnRleHQ/OiBvYmplY3R9fSAtIE9iamVjdCB3aXRoIG1ldGFkYXRhIGZvciBMTE1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0Q29kZUJsb2NrcyhmaWxlUGF0aCwgbGluZSwgY29sdW1uLCBkb21Db250ZXh0KSB7XHJcblx0dHJ5IHtcclxuXHRcdC8vIFZhbGlkYXRlIGZpbGUgcGF0aFxyXG5cdFx0Y29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlRmlsZVBhdGgoZmlsZVBhdGgpO1xyXG5cdFx0aWYgKCF2YWxpZGF0aW9uLmlzVmFsaWQpIHtcclxuXHRcdFx0cmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiB2YWxpZGF0aW9uLmVycm9yLCBkb21Db250ZXh0IH07XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gUGFyc2UgQVNUXHJcblx0XHRjb25zdCBhc3QgPSBwYXJzZUZpbGVUb0FTVCh2YWxpZGF0aW9uLmFic29sdXRlUGF0aCk7XHJcblxyXG5cdFx0Ly8gRmluZCB0YXJnZXQgbm9kZVxyXG5cdFx0Y29uc3QgdGFyZ2V0Tm9kZVBhdGggPSBmaW5kSlNYRWxlbWVudEF0UG9zaXRpb24oYXN0LCBsaW5lLCBjb2x1bW4pO1xyXG5cclxuXHRcdGlmICghdGFyZ2V0Tm9kZVBhdGgpIHtcclxuXHRcdFx0cmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiAnVGFyZ2V0IG5vZGUgbm90IGZvdW5kIGF0IHNwZWNpZmllZCBsaW5lL2NvbHVtbicsIGRvbUNvbnRleHQgfTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBDaGVjayBpZiB0aGUgdGFyZ2V0IG5vZGUgaXMgYSBibGFja2xpc3RlZCBjb21wb25lbnRcclxuXHRcdGNvbnN0IGlzQmxhY2tsaXN0ZWQgPSBpc0JsYWNrbGlzdGVkQ29tcG9uZW50KHRhcmdldE5vZGVQYXRoLm5vZGUpO1xyXG5cclxuXHRcdGlmIChpc0JsYWNrbGlzdGVkKSB7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0c3VjY2VzczogdHJ1ZSxcclxuXHRcdFx0XHRmaWxlUGF0aCxcclxuXHRcdFx0XHRzcGVjaWZpY0xpbmU6ICcnLFxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIEdldCBzcGVjaWZpYyBsaW5lIGNvZGVcclxuXHRcdGNvbnN0IHNwZWNpZmljTGluZSA9IGdlbmVyYXRlQ29kZSh0YXJnZXROb2RlUGF0aC5wYXJlbnRQYXRoPy5ub2RlIHx8IHRhcmdldE5vZGVQYXRoLm5vZGUpO1xyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHN1Y2Nlc3M6IHRydWUsXHJcblx0XHRcdGZpbGVQYXRoLFxyXG5cdFx0XHRzcGVjaWZpY0xpbmUsXHJcblx0XHR9O1xyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRjb25zb2xlLmVycm9yKCdbYXN0LXV0aWxzXSBFcnJvciBleHRyYWN0aW5nIGNvZGUgYmxvY2tzOicsIGVycm9yKTtcclxuXHRcdHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogJ0ZhaWxlZCB0byBleHRyYWN0IGNvZGUgYmxvY2tzJywgZG9tQ29udGV4dCB9O1xyXG5cdH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFByb2plY3Qgcm9vdCBwYXRoXHJcbiAqL1xyXG5leHBvcnQgeyBWSVRFX1BST0pFQ1RfUk9PVCB9O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1MUEFEaWdpdGFsLU1hcnRpblxcXFxEZXNrdG9wXFxcXG1scGFkaWdpdGFsXFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXHBsdWdpbnNcXFxcdmlzdWFsLWVkaXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTUxQQURpZ2l0YWwtTWFydGluXFxcXERlc2t0b3BcXFxcbWxwYWRpZ2l0YWxcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxccGx1Z2luc1xcXFx2aXN1YWwtZWRpdG9yXFxcXHZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTUxQQURpZ2l0YWwtTWFydGluL0Rlc2t0b3AvbWxwYWRpZ2l0YWwvY29ycmVjY2lvbi1kZWwtZnJvbnQvY29ycmVjY2lvbi1kZWwtZnJvbnQvcGx1Z2lucy92aXN1YWwtZWRpdG9yL3ZpdGUtcGx1Z2luLWVkaXQtbW9kZS5qc1wiO2ltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcclxuaW1wb3J0IHsgRURJVF9NT0RFX1NUWUxFUyB9IGZyb20gJy4vdmlzdWFsLWVkaXRvci1jb25maWcnO1xyXG5cclxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcclxuY29uc3QgX19kaXJuYW1lID0gcmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4nKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlubGluZUVkaXREZXZQbHVnaW4oKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdG5hbWU6ICd2aXRlOmlubGluZS1lZGl0LWRldicsXHJcblx0XHRhcHBseTogJ3NlcnZlJyxcclxuXHRcdHRyYW5zZm9ybUluZGV4SHRtbCgpIHtcclxuXHRcdFx0Y29uc3Qgc2NyaXB0UGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCAnZWRpdC1tb2RlLXNjcmlwdC5qcycpO1xyXG5cdFx0XHRjb25zdCBzY3JpcHRDb250ZW50ID0gcmVhZEZpbGVTeW5jKHNjcmlwdFBhdGgsICd1dGYtOCcpO1xyXG5cclxuXHRcdFx0cmV0dXJuIFtcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHR0YWc6ICdzY3JpcHQnLFxyXG5cdFx0XHRcdFx0YXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcclxuXHRcdFx0XHRcdGNoaWxkcmVuOiBzY3JpcHRDb250ZW50LFxyXG5cdFx0XHRcdFx0aW5qZWN0VG86ICdib2R5J1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0dGFnOiAnc3R5bGUnLFxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IEVESVRfTU9ERV9TVFlMRVMsXHJcblx0XHRcdFx0XHRpbmplY3RUbzogJ2hlYWQnXHJcblx0XHRcdFx0fVxyXG5cdFx0XHRdO1xyXG5cdFx0fVxyXG5cdH07XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNTFBBRGlnaXRhbC1NYXJ0aW5cXFxcRGVza3RvcFxcXFxtbHBhZGlnaXRhbFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxwbHVnaW5zXFxcXHZpc3VhbC1lZGl0b3JcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXE1MUEFEaWdpdGFsLU1hcnRpblxcXFxEZXNrdG9wXFxcXG1scGFkaWdpdGFsXFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXGNvcnJlY2Npb24tZGVsLWZyb250XFxcXHBsdWdpbnNcXFxcdmlzdWFsLWVkaXRvclxcXFx2aXN1YWwtZWRpdG9yLWNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvTUxQQURpZ2l0YWwtTWFydGluL0Rlc2t0b3AvbWxwYWRpZ2l0YWwvY29ycmVjY2lvbi1kZWwtZnJvbnQvY29ycmVjY2lvbi1kZWwtZnJvbnQvcGx1Z2lucy92aXN1YWwtZWRpdG9yL3Zpc3VhbC1lZGl0b3ItY29uZmlnLmpzXCI7ZXhwb3J0IGNvbnN0IFBPUFVQX1NUWUxFUyA9IGBcclxuI2lubGluZS1lZGl0b3ItcG9wdXAge1xyXG5cdHdpZHRoOiAzNjBweDtcclxuXHRwb3NpdGlvbjogZml4ZWQ7XHJcblx0ei1pbmRleDogMTAwMDA7XHJcblx0YmFja2dyb3VuZDogIzE2MTcxODtcclxuXHRjb2xvcjogd2hpdGU7XHJcblx0Ym9yZGVyOiAxcHggc29saWQgIzRhNTU2ODtcclxuXHRib3JkZXItcmFkaXVzOiAxNnB4O1xyXG5cdHBhZGRpbmc6IDhweDtcclxuXHRib3gtc2hhZG93OiAwIDRweCAxMnB4IHJnYmEoMCwwLDAsMC4yKTtcclxuXHRmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG5cdGdhcDogMTBweDtcclxuXHRkaXNwbGF5OiBub25lO1xyXG59XHJcblxyXG5AbWVkaWEgKG1heC13aWR0aDogNzY4cHgpIHtcclxuXHQjaW5saW5lLWVkaXRvci1wb3B1cCB7XHJcblx0XHR3aWR0aDogY2FsYygxMDAlIC0gMjBweCk7XHJcblx0fVxyXG59XHJcblxyXG4jaW5saW5lLWVkaXRvci1wb3B1cC5pcy1hY3RpdmUge1xyXG5cdGRpc3BsYXk6IGZsZXg7XHJcblx0dG9wOiA1MCU7XHJcblx0bGVmdDogNTAlO1xyXG5cdHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xyXG59XHJcblxyXG4jaW5saW5lLWVkaXRvci1wb3B1cC5pcy1kaXNhYmxlZC12aWV3IHtcclxuXHRwYWRkaW5nOiAxMHB4IDE1cHg7XHJcbn1cclxuXHJcbiNpbmxpbmUtZWRpdG9yLXBvcHVwIHRleHRhcmVhIHtcclxuXHRoZWlnaHQ6IDEwMHB4O1xyXG5cdHBhZGRpbmc6IDRweCA4cHg7XHJcblx0YmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XHJcblx0Y29sb3I6IHdoaXRlO1xyXG5cdGZvbnQtZmFtaWx5OiBpbmhlcml0O1xyXG5cdGZvbnQtc2l6ZTogMC44NzVyZW07XHJcblx0bGluZS1oZWlnaHQ6IDEuNDI7XHJcblx0cmVzaXplOiBub25lO1xyXG5cdG91dGxpbmU6IG5vbmU7XHJcbn1cclxuXHJcbiNpbmxpbmUtZWRpdG9yLXBvcHVwIC5idXR0b24tY29udGFpbmVyIHtcclxuXHRkaXNwbGF5OiBmbGV4O1xyXG5cdGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7XHJcblx0Z2FwOiAxMHB4O1xyXG59XHJcblxyXG4jaW5saW5lLWVkaXRvci1wb3B1cCAucG9wdXAtYnV0dG9uIHtcclxuXHRib3JkZXI6IG5vbmU7XHJcblx0cGFkZGluZzogNnB4IDE2cHg7XHJcblx0Ym9yZGVyLXJhZGl1czogOHB4O1xyXG5cdGN1cnNvcjogcG9pbnRlcjtcclxuXHRmb250LXNpemU6IDAuNzVyZW07XHJcblx0Zm9udC13ZWlnaHQ6IDcwMDtcclxuXHRoZWlnaHQ6IDM0cHg7XHJcblx0b3V0bGluZTogbm9uZTtcclxufVxyXG5cclxuI2lubGluZS1lZGl0b3ItcG9wdXAgLnNhdmUtYnV0dG9uIHtcclxuXHRiYWNrZ3JvdW5kOiAjNjczZGU2O1xyXG5cdGNvbG9yOiB3aGl0ZTtcclxufVxyXG5cclxuI2lubGluZS1lZGl0b3ItcG9wdXAgLmNhbmNlbC1idXR0b24ge1xyXG5cdGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xyXG5cdGJvcmRlcjogMXB4IHNvbGlkICMzYjNkNGE7XHJcblx0Y29sb3I6IHdoaXRlO1xyXG5cclxuXHQmOmhvdmVyIHtcclxuXHRiYWNrZ3JvdW5kOiM0NzQ5NTg7XHJcblx0fVxyXG59XHJcbmA7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UG9wdXBIVE1MVGVtcGxhdGUoc2F2ZUxhYmVsLCBjYW5jZWxMYWJlbCkge1xyXG5cdHJldHVybiBgXHJcblx0PHRleHRhcmVhPjwvdGV4dGFyZWE+XHJcblx0PGRpdiBjbGFzcz1cImJ1dHRvbi1jb250YWluZXJcIj5cclxuXHRcdDxidXR0b24gY2xhc3M9XCJwb3B1cC1idXR0b24gY2FuY2VsLWJ1dHRvblwiPiR7Y2FuY2VsTGFiZWx9PC9idXR0b24+XHJcblx0XHQ8YnV0dG9uIGNsYXNzPVwicG9wdXAtYnV0dG9uIHNhdmUtYnV0dG9uXCI+JHtzYXZlTGFiZWx9PC9idXR0b24+XHJcblx0PC9kaXY+XHJcblx0YDtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IEVESVRfTU9ERV9TVFlMRVMgPSBgXHJcblx0I3Jvb3RbZGF0YS1lZGl0LW1vZGUtZW5hYmxlZD1cInRydWVcIl0gW2RhdGEtZWRpdC1pZF0ge1xyXG5cdFx0Y3Vyc29yOiBwb2ludGVyOyBcclxuXHRcdG91dGxpbmU6IDJweCBkYXNoZWQgIzM1N0RGOTsgXHJcblx0XHRvdXRsaW5lLW9mZnNldDogMnB4O1xyXG5cdFx0bWluLWhlaWdodDogMWVtO1xyXG5cdH1cclxuXHQjcm9vdFtkYXRhLWVkaXQtbW9kZS1lbmFibGVkPVwidHJ1ZVwiXSBpbWdbZGF0YS1lZGl0LWlkXSB7XHJcblx0XHRvdXRsaW5lLW9mZnNldDogLTJweDtcclxuXHR9XHJcblx0I3Jvb3RbZGF0YS1lZGl0LW1vZGUtZW5hYmxlZD1cInRydWVcIl0ge1xyXG5cdFx0Y3Vyc29yOiBwb2ludGVyO1xyXG5cdH1cclxuXHQjcm9vdFtkYXRhLWVkaXQtbW9kZS1lbmFibGVkPVwidHJ1ZVwiXSBbZGF0YS1lZGl0LWlkXTpob3ZlciB7XHJcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAjMzU3REY5MzM7XHJcblx0XHRvdXRsaW5lLWNvbG9yOiAjMzU3REY5OyBcclxuXHR9XHJcblxyXG5cdEBrZXlmcmFtZXMgZmFkZUluVG9vbHRpcCB7XHJcblx0XHRmcm9tIHtcclxuXHRcdFx0b3BhY2l0eTogMDtcclxuXHRcdFx0dHJhbnNmb3JtOiB0cmFuc2xhdGVZKDVweCk7XHJcblx0XHR9XHJcblx0XHR0byB7XHJcblx0XHRcdG9wYWNpdHk6IDE7XHJcblx0XHRcdHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdCNpbmxpbmUtZWRpdG9yLWRpc2FibGVkLXRvb2x0aXAge1xyXG5cdFx0ZGlzcGxheTogbm9uZTsgXHJcblx0XHRvcGFjaXR5OiAwOyBcclxuXHRcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuXHRcdGJhY2tncm91bmQtY29sb3I6ICMxRDFFMjA7XHJcblx0XHRjb2xvcjogd2hpdGU7XHJcblx0XHRwYWRkaW5nOiA0cHggOHB4O1xyXG5cdFx0Ym9yZGVyLXJhZGl1czogOHB4O1xyXG5cdFx0ei1pbmRleDogMTAwMDE7XHJcblx0XHRmb250LXNpemU6IDE0cHg7XHJcblx0XHRib3JkZXI6IDFweCBzb2xpZCAjM0IzRDRBO1xyXG5cdFx0bWF4LXdpZHRoOiAxODRweDtcclxuXHRcdHRleHQtYWxpZ246IGNlbnRlcjtcclxuXHR9XHJcblxyXG5cdCNpbmxpbmUtZWRpdG9yLWRpc2FibGVkLXRvb2x0aXAudG9vbHRpcC1hY3RpdmUge1xyXG5cdFx0ZGlzcGxheTogYmxvY2s7XHJcblx0XHRhbmltYXRpb246IGZhZGVJblRvb2x0aXAgMC4ycyBlYXNlLW91dCBmb3J3YXJkcztcclxuXHR9XHJcbmA7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTUxQQURpZ2l0YWwtTWFydGluXFxcXERlc2t0b3BcXFxcbWxwYWRpZ2l0YWxcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTUxQQURpZ2l0YWwtTWFydGluXFxcXERlc2t0b3BcXFxcbWxwYWRpZ2l0YWxcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxcY29ycmVjY2lvbi1kZWwtZnJvbnRcXFxccGx1Z2luc1xcXFx2aXRlLXBsdWdpbi1pZnJhbWUtcm91dGUtcmVzdG9yYXRpb24uanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL01MUEFEaWdpdGFsLU1hcnRpbi9EZXNrdG9wL21scGFkaWdpdGFsL2NvcnJlY2Npb24tZGVsLWZyb250L2NvcnJlY2Npb24tZGVsLWZyb250L3BsdWdpbnMvdml0ZS1wbHVnaW4taWZyYW1lLXJvdXRlLXJlc3RvcmF0aW9uLmpzXCI7ZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaWZyYW1lUm91dGVSZXN0b3JhdGlvblBsdWdpbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgbmFtZTogJ3ZpdGU6aWZyYW1lLXJvdXRlLXJlc3RvcmF0aW9uJyxcclxuICAgIGFwcGx5OiAnc2VydmUnLFxyXG4gICAgdHJhbnNmb3JtSW5kZXhIdG1sKCkge1xyXG4gICAgICBjb25zdCBzY3JpcHQgPSBgXHJcbiAgICAgIGNvbnN0IEFMTE9XRURfUEFSRU5UX09SSUdJTlMgPSBbXHJcbiAgICAgICAgICBcImh0dHBzOi8vaG9yaXpvbnMuaG9zdGluZ2VyLmNvbVwiLFxyXG4gICAgICAgICAgXCJodHRwczovL2hvcml6b25zLmhvc3Rpbmdlci5kZXZcIixcclxuICAgICAgICAgIFwiaHR0cHM6Ly9ob3Jpem9ucy1mcm9udGVuZC1sb2NhbC5ob3N0aW5nZXIuZGV2XCIsXHJcbiAgICAgIF07XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgcGFnZSBpcyBpbiBhbiBpZnJhbWVcclxuICAgICAgICBpZiAod2luZG93LnNlbGYgIT09IHdpbmRvdy50b3ApIHtcclxuICAgICAgICAgIGNvbnN0IFNUT1JBR0VfS0VZID0gJ2hvcml6b25zLWlmcmFtZS1zYXZlZC1yb3V0ZSc7XHJcblxyXG4gICAgICAgICAgY29uc3QgZ2V0Q3VycmVudFJvdXRlID0gKCkgPT4gbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2ggKyBsb2NhdGlvbi5oYXNoO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHNhdmUgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgY3VycmVudFJvdXRlID0gZ2V0Q3VycmVudFJvdXRlKCk7XHJcbiAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShTVE9SQUdFX0tFWSwgY3VycmVudFJvdXRlKTtcclxuICAgICAgICAgICAgICB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKHttZXNzYWdlOiAncm91dGUtY2hhbmdlZCcsIHJvdXRlOiBjdXJyZW50Um91dGV9LCAnKicpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHt9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIGNvbnN0IHJlcGxhY2VIaXN0b3J5U3RhdGUgPSAodXJsKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgJycsIHVybCk7XHJcbiAgICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IFBvcFN0YXRlRXZlbnQoJ3BvcHN0YXRlJywgeyBzdGF0ZTogaGlzdG9yeS5zdGF0ZSB9KSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge31cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBjb25zdCByZXN0b3JlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHNhdmVkID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSk7XHJcbiAgICAgICAgICAgICAgaWYgKCFzYXZlZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIXNhdmVkLnN0YXJ0c1dpdGgoJy8nKSkge1xyXG4gICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShTVE9SQUdFX0tFWSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gZ2V0Q3VycmVudFJvdXRlKCk7XHJcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgIT09IHNhdmVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlcGxhY2VIaXN0b3J5U3RhdGUoc2F2ZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlcGxhY2VIaXN0b3J5U3RhdGUoJy8nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IChkb2N1bWVudC5ib2R5Py5pbm5lclRleHQgfHwgJycpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJlc3RvcmVkIHJvdXRlIHJlc3VsdHMgaW4gdG9vIGxpdHRsZSBjb250ZW50LCBhc3N1bWUgaXQgaXMgaW52YWxpZCBhbmQgbmF2aWdhdGUgaG9tZVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA8IDUwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICByZXBsYWNlSGlzdG9yeVN0YXRlKCcvJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIHt9XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHt9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsUHVzaFN0YXRlID0gaGlzdG9yeS5wdXNoU3RhdGU7XHJcbiAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgb3JpZ2luYWxQdXNoU3RhdGUuYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgICAgIHNhdmUoKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxSZXBsYWNlU3RhdGUgPSBoaXN0b3J5LnJlcGxhY2VTdGF0ZTtcclxuICAgICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlID0gZnVuY3Rpb24oLi4uYXJncykge1xyXG4gICAgICAgICAgICBvcmlnaW5hbFJlcGxhY2VTdGF0ZS5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICAgICAgc2F2ZSgpO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICBjb25zdCBnZXRQYXJlbnRPcmlnaW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uYW5jZXN0b3JPcmlnaW5zICYmXHJcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5hbmNlc3Rvck9yaWdpbnMubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmFuY2VzdG9yT3JpZ2luc1swXTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmIChkb2N1bWVudC5yZWZlcnJlcikge1xyXG4gICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVUkwoZG9jdW1lbnQucmVmZXJyZXIpLm9yaWdpbjtcclxuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiSW52YWxpZCByZWZlcnJlciBVUkw6XCIsIGRvY3VtZW50LnJlZmVycmVyKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHNhdmUpO1xyXG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBzYXZlKTtcclxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICBjb25zdCBwYXJlbnRPcmlnaW4gPSBnZXRQYXJlbnRPcmlnaW4oKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGE/LnR5cGUgPT09IFwicmVkaXJlY3QtaG9tZVwiICYmIHBhcmVudE9yaWdpbiAmJiBBTExPV0VEX1BBUkVOVF9PUklHSU5TLmluY2x1ZGVzKHBhcmVudE9yaWdpbikpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVkID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX0tFWSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoc2F2ZWQgJiYgc2F2ZWQgIT09ICcvJykge1xyXG4gICAgICAgICAgICAgICAgICByZXBsYWNlSGlzdG9yeVN0YXRlKCcvJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICByZXN0b3JlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICBgO1xyXG5cclxuICAgICAgcmV0dXJuIFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0YWc6ICdzY3JpcHQnLFxyXG4gICAgICAgICAgYXR0cnM6IHsgdHlwZTogJ21vZHVsZScgfSxcclxuICAgICAgICAgIGNoaWxkcmVuOiBzY3JpcHQsXHJcbiAgICAgICAgICBpbmplY3RUbzogJ2hlYWQnXHJcbiAgICAgICAgfVxyXG4gICAgICBdO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNTFBBRGlnaXRhbC1NYXJ0aW5cXFxcRGVza3RvcFxcXFxtbHBhZGlnaXRhbFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxwbHVnaW5zXFxcXHNlbGVjdGlvbi1tb2RlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNTFBBRGlnaXRhbC1NYXJ0aW5cXFxcRGVza3RvcFxcXFxtbHBhZGlnaXRhbFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxjb3JyZWNjaW9uLWRlbC1mcm9udFxcXFxwbHVnaW5zXFxcXHNlbGVjdGlvbi1tb2RlXFxcXHZpdGUtcGx1Z2luLXNlbGVjdGlvbi1tb2RlLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9NTFBBRGlnaXRhbC1NYXJ0aW4vRGVza3RvcC9tbHBhZGlnaXRhbC9jb3JyZWNjaW9uLWRlbC1mcm9udC9jb3JyZWNjaW9uLWRlbC1mcm9udC9wbHVnaW5zL3NlbGVjdGlvbi1tb2RlL3ZpdGUtcGx1Z2luLXNlbGVjdGlvbi1tb2RlLmpzXCI7aW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xyXG5cclxuY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKTtcclxuY29uc3QgX19kaXJuYW1lID0gcmVzb2x2ZShfX2ZpbGVuYW1lLCAnLi4nKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNlbGVjdGlvbk1vZGVQbHVnaW4oKSB7XHJcblx0cmV0dXJuIHtcclxuXHRcdG5hbWU6ICd2aXRlOnNlbGVjdGlvbi1tb2RlJyxcclxuXHRcdGFwcGx5OiAnc2VydmUnLFxyXG5cclxuXHRcdHRyYW5zZm9ybUluZGV4SHRtbCgpIHtcclxuXHRcdFx0Y29uc3Qgc2NyaXB0UGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCAnc2VsZWN0aW9uLW1vZGUtc2NyaXB0LmpzJyk7XHJcblx0XHRcdGNvbnN0IHNjcmlwdENvbnRlbnQgPSByZWFkRmlsZVN5bmMoc2NyaXB0UGF0aCwgJ3V0Zi04Jyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gW1xyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHRhZzogJ3NjcmlwdCcsXHJcblx0XHRcdFx0XHRhdHRyczogeyB0eXBlOiAnbW9kdWxlJyB9LFxyXG5cdFx0XHRcdFx0Y2hpbGRyZW46IHNjcmlwdENvbnRlbnQsXHJcblx0XHRcdFx0XHRpbmplY3RUbzogJ2JvZHknLFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdF07XHJcblx0XHR9LFxyXG5cdH07XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyYyxPQUFPQSxXQUFVO0FBQzVkLE9BQU8sV0FBVztBQUNsQixTQUFTLGNBQWMsb0JBQW9COzs7QUNGOGdCLE9BQU9DLFdBQVU7QUFDMWtCLFNBQVMsU0FBQUMsY0FBYTtBQUN0QixPQUFPQyxvQkFBbUI7QUFDMUIsWUFBWSxPQUFPO0FBQ25CLE9BQU9DLFNBQVE7OztBQ0pzZSxPQUFPLFFBQVE7QUFDcGdCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLGNBQWM7QUFDckIsU0FBUyxhQUFhO0FBQ3RCLE9BQU8sbUJBQW1CO0FBQzFCO0FBQUEsRUFDQztBQUFBLEVBQ0E7QUFBQSxPQUNNO0FBVDhULElBQU0sMkNBQTJDO0FBV3RYLElBQU0sYUFBYSxjQUFjLHdDQUFlO0FBQ2hELElBQU1DLGFBQVksS0FBSyxR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QUV0QixJQUFNLFNBQVMsYUFBYTtBQUM1QixJQUFNLGNBQWMsT0FBTztBQUUzQixPQUFPLFFBQVEsQ0FBQyxLQUFLLFlBQVk7QUFuT2pDO0FBb09DLE9BQUksd0NBQVMsVUFBVCxtQkFBZ0IsV0FBVyxTQUFTLDhCQUE4QjtBQUNyRTtBQUFBLEVBQ0Q7QUFFQSxjQUFZLEtBQUssT0FBTztBQUN6QjtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLGNBQWM7QUFBQSxFQUNkLFNBQVM7QUFBQSxJQUNSLFdBQVc7QUFBQSxFQUNaO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUixHQUFJLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxvQkFBa0IsR0FBRyw2QkFBNkIsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7QUFBQSxJQUNoSCxNQUFNO0FBQUEsSUFDTjtBQUFBLEVBQ0Q7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNSLGdDQUFnQztBQUFBLElBQ2pDO0FBQUEsSUFDQSxjQUFjO0FBQUEsRUFDZjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsWUFBWSxDQUFDLFFBQVEsT0FBTyxRQUFRLE9BQU8sT0FBUztBQUFBLElBQ3BELE9BQU87QUFBQSxNQUNOLEtBQUtDLE1BQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDckM7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixlQUFlO0FBQUEsTUFDZCxVQUFVO0FBQUEsUUFDVDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAicGF0aCIsICJwYXJzZSIsICJ0cmF2ZXJzZUJhYmVsIiwgImZzIiwgIl9fZGlybmFtZSIsICJwYXRoIiwgInBhdGgiLCAicGFyc2UiLCAidHJhdmVyc2VCYWJlbCIsICJmcyIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fZGlybmFtZSIsICJyZWFkRmlsZVN5bmMiLCAicmVzb2x2ZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwiLCAiX19maWxlbmFtZSIsICJmaWxlVVJMVG9QYXRoIiwgIl9fZGlybmFtZSIsICJyZXNvbHZlIiwgInJlYWRGaWxlU3luYyIsICJwYXRoIl0KfQo=
