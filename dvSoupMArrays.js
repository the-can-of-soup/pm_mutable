// Name: Mutable Arrays
// ID: dvSoupMArrays
// Description: Combine all of the benefits of Lists and Arrays, and more! Supports infinite recursion and has cross-compat with Arrays and Iterators.
// By: the-can-of-soup and DashDevmationsDash
// License: MIT

// GitHub repo: https://github.com/the-can-of-soup/pm_mutable



/*
MISCELLANEOUS APIS

A function named `dvSoupMutableHandler` may be added to custom types
to override their display behavior in cells of the Mutable Arrays/
Objects table render. It should return an HTML string.

Alternatively, name the function `dvSoupMArrayHandler` or
`dvSoupMObjectHandler` to make it only apply to Mutable Arrays/Objects
respectively.

CONTAINER API

This extension provides a container API so that other container types
added by other extensions can be handled properly in recursive cases.
Each compatible container type should categorize itself as either an
array (list-like container) or a map (object-like container).

Compatible containers should have a static property in their class;
for array-like containers, it should be named `dvSoupArrayInfo`; for
map-like containers, `dvSoupMapInfo`. This property should hold an
object containing implementations of some container API methods.

These methods will be called as an instance of the container type, so
use `this` accordingly. Note: `vm.dvSoupMutableUtil.callArrayHandler`
and `vm.dvSoupMutableUtil.callMapHandler` may be used to call handlers.

See `vm.dvSoupMutableUtil.defaultArrayInfo` and `vm.dvSoupMutableUtil
.defaultMapInfo` for fallback implementations.

*items()
  Generator function that should yield items from the container in
  order. For map-like containers, each item should be a key-value pair.
  Either this or `toNative` (or both) are required.

toNative()
  Should return a native `Array` or `Map` that holds all of the
  container's items in order. This array/map does not need to be new,
  as it will not be mutated. Either this or `items` (or both) are
  required.

is(other)
  Should return true if `other` is considered the same instance as
  `this`. This should NOT necessarily return true if the arrays have
  the same values.

getDisplay(isMonitor, render, ancestors)
  If present, overrides the default table renderer for container
  displays. Should return an HTML string to use to display the
  container. `isMonitor` will be true if the display is a monitor.
  `render` is a function that takes a value and will return the HTML
  string that would be used for that value in a cell of the table if
  using the default renderer. `ancestors` is an array containing all
  ancestors of the current value in the container tree.

getBlankDisplay()
  Should return an HTML string to use in the default table renderer if
  the container is empty.

getCyclicalReferenceDisplay()
  Should return an HTML string to use in the default table renderer if
  the container is its own ancestor; i.e. if
  `this.dvSoupArrayInfo.is(ancestor)` is true.

wrapDisplay(displayHTML)
  Should return a modified HTML string from `displayHTML` to wrap the
  default table renderer, e.g. to add a header or footer to the
  container display. Note: this will NOT wrap blank containers and
  cyclical references.
*/

(function(Scratch) {
  'use strict';

  const loopIcon = './static/blocks-media/repeat.svg';

  const vm = Scratch.vm;
  const runtime = vm.runtime;

  let jwArray = null;
  let dogeiscutObject = null;
  let jwLambda = null;
  let MObjectType = null;



  // UTIL

  // Copied from: https://github.com/PenguinMod/PenguinMod-Vm/blob/develop/src/util/uid.js
  const soup_ = '!#%()*+,-./:;=?@[]^_`{|}~' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const uid = function () {
    const length = 20;
    const soupLength = soup_.length;
    const id = [];
    for (let i = 0; i < length; i++) {
      id[i] = soup_.charAt(Math.random() * soupLength);
    }
    return id.join('');
  };

  function escapeHTML(unsafe) {
    // Copied from jwTargets

    return unsafe
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function span(text) {
    // Copied from jwArray, jwVector

    let el = document.createElement('span');
    el.innerHTML = text;
    el.style.display = 'hidden';
    el.style.whiteSpace = 'nowrap';
    el.style.width = '100%';
    el.style.textAlign = 'center';
    return el;
  }

  function formatNumberForTableDisplay(n) {
    // Copied from dogeiscutObjects

    if (n >= 1e6) {
      return n.toExponential(4);
    } else {
      n = Math.floor(n * 1000) / 1000;
      return n.toFixed(Math.min(3, (String(n).split('.')[1] || '').length));
    }
  }

  function trueSign(n) {
    // The `1 / n < 0` expression catches -0.
    return (n < 0 || 1 / n < 0) ? -1 : 1;
  }

  function mod(n, m = 1) {
    /* if (trueSign(n) === -1) {
      return (m - Math.abs(n % m)) % m;
    } else {
      return n % m;
    } */
    return ((n % m) + m) % m;
  }

  async function getExtensionURL(url) {
    return await fetch(url)
      .then(request => request.text());
  }

  function descendStackInline(compiler, substack, frame) {
    const oldSource = compiler.source;
    compiler.source = '';
    compiler.descendStack(substack, frame);
    const result = compiler.source;
    compiler.source = oldSource;
    return result;
  }

  const mapContainerTypes = [
    'rawMap',
    'rawObject',
    'dogeiscutObject',
    'dvSoupMObject',
  ];

  function getRawContainerType(value, nullIfNonNative = true) {
    if (typeof value !== 'object' || value === null) return null;

    if (value instanceof Array) return 'rawArray';
    if (value instanceof Map) return 'rawMap';
    const prototype = Object.getPrototypeOf(value);
    if ((prototype === null || prototype === Object.prototype) && !(Symbol.iterator in value)) return 'rawObject';

    /*
    if (value instanceof jwArray.Type) return 'jwArray';
    if (value instanceof dogeiscutObject.Type) return 'dogeiscutObject';
    if (value instanceof MArrayType) return 'dvSoupMArray';
    if (MObjectType !== null && value instanceof MObjectType) return 'dvSoupMObject';
    */

    return nullIfNonNative ? null : 'nonNative';
  }

  class CommonUtil {
    static vm = vm;
    static runtime = runtime;

    static uid = uid;
    static escapeHTML = escapeHTML;
    static formatNumberForTableDisplay = formatNumberForTableDisplay;
    static trueSign = trueSign;
    static mod = mod;
    static getExtensionURL = getExtensionURL;
    static descendStackInline = descendStackInline;
    static getRawContainerType = getRawContainerType;

    static isContainer(value) {
      const rawContainerType = getRawContainerType(value, /* nullIfNonNative = */ false);
      if (rawContainerType === null) return false;
      if (rawContainerType !== 'nonNative') return true;

      const constructor = Object.getPrototypeOf(value).constructor;
      return 'dvSoupArrayInfo' in constructor || 'dvSoupMapInfo' in constructor;
    }

    static isArrayLike(value) {
      const rawContainerType = getRawContainerType(value, /* nullIfNonNative = */ false);
      if (rawContainerType === null) return false;

      return (rawContainerType !== 'nonNative' && rawContainerType in CommonUtil.nativeArrayInfo)
        || 'dvSoupArrayInfo' in Object.getPrototypeOf(value).constructor;
    }

    static isMapLike(value) {
      const rawContainerType = getRawContainerType(value, /* nullIfNonNative = */ false);
      if (rawContainerType === null) return false;

      return (rawContainerType !== 'nonNative' && rawContainerType in CommonUtil.nativeMapInfo)
        || 'dvSoupMapInfo' in Object.getPrototypeOf(value).constructor;
    }

    static callArrayHandler(value, handlerName, ...args) {
      const rawContainerType = getRawContainerType(value);
      const handler = CommonUtil.nativeArrayInfo?.[rawContainerType]?.[handlerName]
        ?? Object.getPrototypeOf(value).constructor.dvSoupArrayInfo?.[handlerName]
        ?? CommonUtil.defaultArrayInfo[handlerName];
      return handler.call(value, ...args);
    }

    static callMapHandler(value, handlerName, ...args) {
      const rawContainerType = getRawContainerType(value);
      const handler = CommonUtil.nativeMapInfo?.[rawContainerType]?.[handlerName]
        ?? Object.getPrototypeOf(value).constructor.dvSoupMapInfo?.[handlerName]
        ?? CommonUtil.defaultMapInfo[handlerName];
      return handler.call(value, ...args);
    }

    static defaultArrayInfo = {
      *items() {
        yield* CommonUtil.callArrayHandler(this, 'toNative');
      },

      toNative() {
        return Array.from(CommonUtil.callArrayHandler(this, 'items'));
      },

      is(other) {
        return this === other;
      },

      getBlankDisplay() {
        return `<i style="opacity: 0.75;">&lt;Blank Array-like&gt;</i>`;
      },

      getCyclicalReferenceDisplay() {
        return `<i style="opacity: 0.75;">&lt;Cyclical reference&gt;</i>`;
      },

      wrapDisplay(displayHTML) {
        return displayHTML;
      },

      getDisplay(isMonitor, render, ancestors) {
        // Array-like table render
        // Credit: Modified copy of DogeisCut's code in Objects

        const border = isMonitor ? '1px solid #fff' : '1px solid #77777777';
        const keyBackground = isMonitor ? '#ffffff33' : '#77777724';
        const background = isMonitor ? '#ffffff00' : '#ffffff00';
        const entryLimit = 1000;

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.margin = '2px 0';
        table.style.fontSize = '12px';
        table.style.background = background;
        table.style.border = border;

        const array = CommonUtil.callArrayHandler(this, 'toNative');
        const limitedArray = array.slice(0, entryLimit);

        if (limitedArray.length === 0) {
          const text = span(CommonUtil.callArrayHandler(this, 'getBlankDisplay'));

          return text.outerHTML;
        }

        limitedArray.forEach((value, index) => {
          const centeringDiv = document.createElement('div');
          centeringDiv.style.display = 'flex';
          centeringDiv.style.justifyContent = 'center';

          const row = document.createElement('tr');

          const valueCell = document.createElement('td');
          valueCell.style.border = border;
          valueCell.style.padding = '2px 6px';
          valueCell.style.background = background;

          centeringDiv.innerHTML = render(value);

          valueCell.appendChild(centeringDiv);
          row.appendChild(valueCell);
          table.appendChild(row);
        });

        if (array.length > entryLimit) {
          const moreRow = document.createElement('tr');
          const moreCell = document.createElement('td');
          moreCell.colSpan = 2;
          moreCell.textContent = `... ${array.length - entryLimit} more values`;
          moreCell.style.textAlign = 'center';
          moreCell.style.fontStyle = 'italic';
          moreCell.style.color = border;
          moreRow.appendChild(moreCell);
          table.appendChild(moreRow);
        }

        return CommonUtil.callArrayHandler(this, 'wrapDisplay', table.outerHTML);
      },
    };

    static defaultMapInfo = {
      *items() {
        yield* CommonUtil.callMapHandler(this, 'toNative');
      },

      toNative() {
        return new Map(CommonUtil.callMapHandler(this, 'items'));
      },

      is(other) {
        return this === other;
      },

      getBlankDisplay() {
        return `<i style="opacity: 0.75;">&lt;Blank Array-like&gt;</i>`;
      },

      getCyclicalReferenceDisplay() {
        return `<i style="opacity: 0.75;">&lt;Cyclical reference&gt;</i>`;
      },

      wrapDisplay(displayHTML) {
        return displayHTML;
      },

      getDisplay(isMonitor, render, ancestors) {
        // Map-like table render
        // Credit: Modified copy of DogeisCut's code in Objects

        const border = isMonitor ? '1px solid #fff' : '1px solid #77777777';
        const keyBackground = isMonitor ? '#ffffff33' : '#77777724';
        const background = isMonitor ? '#ffffff00' : '#ffffff00';
        const entryLimit = 1000;

        const table = document.createElement('table');
        table.style.borderCollapse = 'collapse';
        table.style.margin = '2px 0';
        table.style.fontSize = '12px';
        table.style.background = background;
        table.style.border = border;

        const map = CommonUtil.callMapHandler(this, 'toNative');
        const limitedMap = new Map(Array.from(map).slice(0, entryLimit));

        if (limitedMap.size === 0) {
          const text = span(CommonUtil.callMapHandler(this, 'getBlankDisplay'));

          return text.outerHTML;
        }

        limitedMap.forEach((value, key) => {
          const keyCenteringDiv = document.createElement('div');
          keyCenteringDiv.style.display = 'flex';
          keyCenteringDiv.style.justifyContent = 'center';

          const valueCenteringDiv = document.createElement('div');
          valueCenteringDiv.style.display = 'flex';
          valueCenteringDiv.style.justifyContent = 'center';

          const row = document.createElement('tr');

          const keyCell = document.createElement('td');
          keyCell.style.border = border;
          keyCell.style.padding = '2px 6px';
          keyCell.style.background = keyBackground;
          keyCell.style.fontWeight = 'bold';

          keyCenteringDiv.innerHTML = escapeHTML(Scratch.Cast.toString(key));

          const valueCell = document.createElement('td');
          valueCell.style.border = border;
          valueCell.style.padding = '2px 6px';
          valueCell.style.background = background;

          valueCenteringDiv.innerHTML = render(value);

          keyCell.appendChild(keyCenteringDiv);
          row.appendChild(keyCell);
          valueCell.appendChild(valueCenteringDiv);
          row.appendChild(valueCell);
          table.appendChild(row);
        });

        if (map.size > entryLimit) {
          const moreRow = document.createElement('tr');
          const moreCell = document.createElement('td');
          moreCell.colSpan = 2;
          moreCell.textContent = `... ${map.size - entryLimit} more entries`;
          moreCell.style.textAlign = 'center';
          moreCell.style.fontStyle = 'italic';
          moreCell.style.color = border;
          moreRow.appendChild(moreCell);
          table.appendChild(moreRow);
        }
        
        return CommonUtil.callMapHandler(this, 'wrapDisplay', table.outerHTML);
      },
    };

    static nativeArrayInfo = {
      rawArray: {
        *items() { yield* this; },
        toNative() { return this; },

        getBlankDisplay() { return `<i style="opacity: 0.75;">&lt;Blank Raw Array&gt;</i>`; },
        getCyclicalReferenceDisplay() { return `<i style="opacity: 0.75;">&lt;Cyclical Raw Array ref.&gt;</i>`; },
      },
    };

    static nativeMapInfo = {
      rawMap: {
        *items() { yield* this; },
        toNative() { return this; },

        getBlankDisplay() { return `<i style="opacity: 0.75;">&lt;Blank Raw Map&gt;</i>`; },
        getCyclicalReferenceDisplay() { return `<i style="opacity: 0.75;">&lt;Cyclical Raw Map ref.&gt;</i>`; },
      },
      rawObject: {
        *items() {
          for (let key in this) {
            if (this.hasOwnProperty(key)) yield [key, this[key]];
          }
        },
        toNative() { return this; },

        getBlankDisplay() { return `<i style="opacity: 0.75;">&lt;Blank Raw Object&gt;</i>`; },
        getCyclicalReferenceDisplay() { return `<i style="opacity: 0.75;">&lt;Cyclical Raw Object ref.&gt;</i>`; },
      },
    };

    static getPatchedArrayInfo() {
      return new Map([
        [jwArray.Type, {
          *items() { yield* this.array; },
          toNative() { return this.array; },
          is(other) { return false; }, // Remove to allow jwklong Arrays to be hidden in display when a cyclical reference

          getBlankDisplay() { return `<i style="opacity: 0.75;">&lt;Blank Array&gt;</i>`; },
          getCyclicalReferenceDisplay() { return `<i style="opacity: 0.75;">&lt;Cyclical Array ref.&gt;</i>`; },
        }],
      ]);
    }

    static getPatchedMapInfo() {
      return new Map([
        [dogeiscutObject.Type, {
          *items() { yield* this.map; },
          toNative() { return this.map; },
          is(other) { return false; }, // Remove to allow DogeisCut Objects to be hidden in display when a cyclical reference

          getBlankDisplay() { return `<i style="opacity: 0.75;">&lt;Blank Object&gt;</i>`; },
          getCyclicalReferenceDisplay() { return `<i style="opacity: 0.75;">&lt;Cyclical Object ref.&gt;</i>`; },
        }],
      ]);
    }

    static tableDisplay(rootValue, isMonitor = false, noWrapper = false) {
      // Credit: Heavily modified copy of DogeisCut's code in Objects

      const border = isMonitor ? '1px solid #fff' : '1px solid #77777777';
      const keyBackground = isMonitor ? '#ffffff33' : '#77777724';
      const background = isMonitor ? '#ffffff00' : '#ffffff00';
      const entryLimit = 1000;

      const rootValueIsMapLike = CommonUtil.isMapLike(rootValue);

      let root = document.createElement('div');
      root.style.display = 'flex';
      root.style.flexDirection = 'column';

      function render(value, ancestors = null) {
        if (ancestors === null) ancestors = [];

        const renderAndAddAncestor = (innerValue) => (render(innerValue, ancestors.concat([value])));

        try {
          const parentValue = ancestors[ancestors.length - 1];
          const parentIsMapLike = CommonUtil.isMapLike(parentValue);
          const parentIsArrayLike = CommonUtil.isArrayLike(parentValue);
          const isArrayLike = CommonUtil.isArrayLike(value);
          const isMapLike = CommonUtil.isMapLike(value);

          switch (typeof value) {
            case 'object':
              if (value === null /* || value === undefined */) return `<i style="opacity: 0.75;">null</i>`;

              if (isMapLike) {
                if (ancestors.some(ancestor => CommonUtil.callMapHandler(value, 'is', ancestor))) {
                  return CommonUtil.callMapHandler(value, 'getCyclicalReferenceDisplay');
                }
                return CommonUtil.callMapHandler(value, 'getDisplay', isMonitor, renderAndAddAncestor, ancestors);
              } else if (isArrayLike) {
                if (ancestors.some(ancestor => CommonUtil.callArrayHandler(value, 'is', ancestor))) {
                  return CommonUtil.callArrayHandler(value, 'getCyclicalReferenceDisplay');
                }
                return CommonUtil.callArrayHandler(value, 'getDisplay', isMonitor, renderAndAddAncestor, ancestors);
              }

              if (parentIsArrayLike && typeof value.dvSoupMArrayHandler === 'function') return value.dvSoupMArrayHandler();
              if (parentIsMapLike && typeof value.dvSoupMObjectHandler === 'function') return value.dvSoupMObjectHandler();
              if (typeof value.dvSoupMutableHandler === 'function') return value.dvSoupMutableHandler();

              if (typeof value.dogeiscutObjectHandler === 'function') return value.dogeiscutObjectHandler();
              if (typeof value.jwArrayHandler === 'function') return value.jwArrayHandler();

              return span(`<i style="opacity: 0.75;">&lt;Unknown object&gt;</i>`).outerHTML;
            case 'undefined':
              return span(`<i style="opacity: 0.75;">undefined</i>`).outerHTML;
            case 'number':
              return span(escapeHTML(formatNumberForTableDisplay(value))).outerHTML;
            case 'boolean':
              return span(Scratch.Cast.toString(value)).outerHTML;
            case 'string':
              return span(`"${escapeHTML(Scratch.Cast.toString(value))}"`).outerHTML;
          }
        } catch (error) {
          console.warn(
            '[Mutable] Error generating table display for value:', value, '\nancestors:', ancestors, '\nrootValue:', rootValue,
            `\nisMonitor: ${isMonitor}, noWrapper: ${noWrapper}`,
            `\nerror:`, error,
          );
        }
        return `?`;
      }

      let mainContentHTML = render(rootValue);
      if (noWrapper) return mainContentHTML;

      root.innerHTML = mainContentHTML;
      root.appendChild(span(`${rootValueIsMapLike ? 'Size' : 'Length'}: ${rootValue.size ?? rootValue.length}`));

      return root;
    }
  }

  class PrivateUtil {

  }



  class MArrayType {
    // PenguinMod
    customId = 'dvSoupMArray';
    _monitorUpToDate = true;
  
    // Custom
    id = null;
    array = null;
    _toListEditorLastResult = null;
  


    // CONSTRUCTORS / DESTRUCTORS

    static serialize(mArray) {
      return []; // @TODO
    }
  
    static unserialize(serialiedMArray) {
      return new MArrayType(); // @TODO
    }
  
    static toMArray(value) {
      if (value instanceof MArrayType) return value;
      return new MArrayType(); // @TODO
    }
  
    constructor(array = null) {
      if (array === null) array = [];
  
      this.array = array;
      this.id = uid().substring(0, 10);
    }



    // HANDLERS
  
    static dvSoupArrayInfo = {
      *items() {
        for (let i = 0; i < this.length; i++) {
          yield* this.array;
        }
      },

      toNative() {
        return this.array;
      },

      is(other) {
        return this === other;
      },

      getBlankDisplay() {
        return ''
          + `<div style="display: grid;">`
          + `<i style="opacity: 0.75">&lt;Blank MArray&gt;</i>`
          + `<small style="white-space: nowrap; width: 100%; text-align: center;">`
          + `<span style="opacity: 0.5; font-family: Consolas, 'Courier New', monospace;">${this.id}</span>`
          + `</small>`
          + `</div>`;
      },

      getCyclicalReferenceDisplay() {
        return ''
          + `<div style="display: grid;">`
          + `<i style="opacity: 0.75">&lt;Cyclical MArray ref.&gt;</i>`
          + `<small style="white-space: nowrap; width: 100%; text-align: center;">`
          + `<span style="opacity: 0.5; font-family: Consolas, 'Courier New', monospace;">${this.id}</span>`
          + `</small>`
          + `</div>`;
      },

      wrapDisplay(displayHTML) {
        return ''
          + `<div style="display: grid;">`
          + displayHTML
          + `<small style="white-space: nowrap; width: 100%; text-align: center;">`
          + `<span style="opacity: 0.5; font-family: Consolas, 'Courier New', monospace;">${this.id}</span>`
          + `</small>`
          + `</div>`;
      },
    };

    divIntoIterHandler(IteratorType, {Item, Done}) {
      // Respects mid-loop array mutations like a `for (let i = 0; i < this.array.length; i++)` loop
      return IteratorType.overArray({kind: 'MArray' /* , kindHTML: '<span style="color: #ff3d6e">M</span>Array' */}, this.array);
    }

    static *fromIterator(...env) {
      return new MArrayType(yield* this.fold([],
        function*(acc, item) {return [...acc, item]}, 
        ...env,
      ));
    }
  
    toString() {
      return 'TODO'; // @TODO
    }
  
    toJSON() {
      return {}; // @TODO
    }
  
    static fromJSON(JSON) {
      // Should return `null` if the JSON is invalid or cannot be converted.
      return new MArrayType(); // @TODO
    }
  
    toReporterContent() {
      return CommonUtil.tableDisplay(this);
    }
  
    toMonitorContent() {
      this._monitorUpToDate = true;
      return CommonUtil.tableDisplay(this, /* isMonitor = */ true);
    }
  
    toListItem() {
      this._monitorUpToDate = true;
      return this.toMonitorContent(); // @TODO
    }
  
    pokeMonitor() {
      this._monitorUpToDate = false;
    }
  
    jwArrayHandler() {
      return `MArray${escapeHTML(`<${this.length}>`)}`;
    }
  
    toListEditor() {
      return this.toJSON();
    }
  
    fromListEditor(edit) {
      if (edit === this._toListEditorLastResult ?? this.toListEditor()) {
        return this;
      }
      return MArrayType.fromJSON(edit) ?? edit;
    }



    // OPERATIONS
  
    get length() {
      return this.array.length;
    }

    *[Symbol.iterator]() {
      for (let i = 0; i < this.length; i++) {
        yield this.array[i];
      }
    }
    
    forEach(callback, thisArg) {
      for (let i = 0; i < this.length; i++) {
        callback(this.array[i], i, this);
      }
    }
    
    push(...values) {
      this.pokeMonitor();
      return this.array.push(...values);
    }
  }

  const MArray = {
    Type: MArrayType,
    Block: {
      blockType: Scratch.BlockType.REPORTER,
      blockShape: Scratch.BlockShape.SQUARE,
      forceOutputType: 'dvSoupMArray',
      disableMonitor: true,
    },
    Argument: {
      shape: Scratch.BlockShape.SQUARE,
      check: ['dvSoupMArray'],
      exemptFromNormalization: true,
    },
  };

  const EmptyArgument = {
    exemptFromNormalization: true,
  };

  class MArraysExtension {
    constructor() {
      // Save reference to helper functions
      vm.dvSoupMutableUtil = CommonUtil;
      vm.dvSoupMArraysUtil = PrivateUtil;

      // Register Iterators collect to mutable array compat
      vm.divFromIter ??= new Map();
      vm.divFromIter.set('Mutable Array', MArrayType.fromIterator);

      // Apply container API patches
      CommonUtil.getPatchedArrayInfo().forEach((arrayInfo, type) => {
        type.dvSoupArrayInfo ??= arrayInfo;
      });
      CommonUtil.getPatchedMapInfo().forEach((mapInfo, type) => {
        type.dvSoupMapInfo ??= mapInfo;
      });

      // Apply table render patches
      // Arrow notation `() => (...)` does NOT work, because `this` would use outer scope
      jwArray.Type.prototype.toReporterContent = function() { return CommonUtil.tableDisplay(this); };
      jwArray.Type.prototype.toMonitorContent = function() { return CommonUtil.tableDisplay(this, /* isMonitor = */ true); };
      dogeiscutObject.Type.prototype.toReporterContent = function() { return CommonUtil.tableDisplay(this); };
      dogeiscutObject.Type.prototype.toMonitorContent = function() { return CommonUtil.tableDisplay(this, /* isMonitor = */ true); };

      // Register compiled blocks
      runtime.registerCompiledExtensionBlocks('dvSoupMArrays', MArraysExtension.getCompileInfo());

      // Register mutable array type
      vm.dvSoupMArray = MArray;
      runtime.registerSerializer(
        'dvSoupMArray',
        MArrayType.serialize,
        MArrayType.unserialize,
      );
    }

    getInfo() {
      return {
        id: 'dvSoupMArrays',
        name: 'Mutable Arrays',
        // color1: '#ff513d', // Color of jwArray
        color1: '#ff3d6e',
        blocks: [

          // CONSTRUCTORS

          {
            opcode: 'newEmpty',
            text: 'blank array',
            ...MArray.Block,
          },
          {
            opcode: 'newNullFilled',
            text: 'null array of length [LENGTH]',
            ...MArray.Block,
            arguments: {
              LENGTH: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 5,
              },
            },
          },
          {
            opcode: 'newFilled',
            text: 'array of [VALUE] with length [LENGTH]',
            ...MArray.Block,
            arguments: {
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo',
              },
              LENGTH: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 5,
              },
            },
          },
          {
            opcode: 'parse',
            text: 'parse [VALUE] as array',
            ...MArray.Block,
            arguments: {
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: '["foo", "bar", "baz"]',
              },
            },
          },
          {
            opcode: 'stringify',
            text: 'stringify [MARRAY] [STRINGIFYTYPE]',
            blockType: Scratch.BlockType.REPORTER,
            arguments: {
              MARRAY: MArray.Argument,
              STRINGIFYTYPE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'compact',
                menu: 'stringifyType',
              },
            },
          },

          '---',

          // C-BLOCKS

          {
            opcode: 'builderCurrent',
            text: 'current array',
            hideFromPalette: true,
            canDragDuplicate: true,
            ...MArray.Block,
          },
          {
            opcode: 'builder',
            text: 'array builder [CURRENT]',
            branches: [{}],
            ...MArray.Block,
            arguments: {
              CURRENT: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'If you can see this, then something went really wrong and you should report an issue on this extension\'s GitHub repo. :)',
                fillIn: 'builderCurrent',
              },
            },
          },
          {
            opcode: 'forIndex',
            text: 'index',
            hideFromPalette: true,
            canDragDuplicate: true,
            blockType: Scratch.BlockType.REPORTER,
          },
          {
            opcode: 'forValue',
            text: 'value',
            hideFromPalette: true,
            canDragDuplicate: true,
            blockType: Scratch.BlockType.REPORTER,
            allowDropAnywhere: true,
          },
          {
            opcode: 'for',
            text: ['for [INDEX] [VALUE] of [MARRAY]', '[ICON]'],
            alignments: [null, null, Scratch.ArgumentAlignment.RIGHT],
            branches: [{}],
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
              INDEX: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'If you can see this, then something went really wrong and you should report an issue on this extension\'s GitHub repo. :)',
                fillIn: 'forIndex',
              },
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'If you can see this, then something went really wrong and you should report an issue on this extension\'s GitHub repo. :)',
                fillIn: 'forValue',
              },
              ICON: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: loopIcon,
              },
            },
          },

          '---',

          // GETTERS

          {
            opcode: 'get',
            text: 'get [INDEX] in [MARRAY]',
            blockType: Scratch.BlockType.REPORTER,
            allowDropAnywhere: true,
            arguments: {
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 1,
              },
              MARRAY: MArray.Argument,
            },
          },
          {
            opcode: 'has',
            text: '[VALUE] in [MARRAY]?',
            blockType: Scratch.BlockType.BOOLEAN,
            arguments: {
              MARRAY: MArray.Argument,
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo',
              },
            },
          },
          {
            opcode: 'length',
            text: 'length of [MARRAY]',
            blockType: Scratch.BlockType.REPORTER,
            arguments: {
              MARRAY: MArray.Argument,
            },
          },
          {
            opcode: 'id',
            text: 'id of [MARRAY]',
            blockType: Scratch.BlockType.REPORTER,
            arguments: {
              MARRAY: MArray.Argument,
            },
          },

          '---',

          // SETTERS

          {
            opcode: 'append',
            text: 'append [VALUE] to [MARRAY]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo',
              },
            },
          },
          {
            opcode: 'insert',
            text: 'insert [VALUE] at [INDEX] in [MARRAY]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo',
              },
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: 'splice',
            text: 'delete [WIDTH] items at [INDEX] in [MARRAY]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
              INDEX: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 1,
              },
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 1,
              },
            },
          },

          '---',

          // FULL ARRAY MUTATE OPERATIONS

          {
            opcode: 'clear',
            text: 'empty [MARRAY]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
            },
          },
          {
            opcode: 'reverse',
            text: 'reverse [MARRAY]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
            },
          },
          {
            opcode: 'extend',
            text: 'extend [MARRAY] with [EXTENSION]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
              EXTENSION: MArray.Argument,
            },
          },
          {
            opcode: 'replace',
            text: 'replace [MARRAY] with [REPLACEMENT]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
              REPLACEMENT: MArray.Argument,
            },
          },
          {
            opcode: 'mapInPlace',
            text: 'map [LAMBDA] over [MARRAY]',
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              MARRAY: MArray.Argument,
              LAMBDA: jwLambda.Argument,
            },
          },

          '---',

          // MUTABILITY OPERATIONS

          {
            opcode: 'isMArray',
            text: '[VALUE] is a mutable array?',
            blockType: Scratch.BlockType.BOOLEAN,
            arguments: {
              VALUE: EmptyArgument,
            },
          },
          {
            opcode: 'copy',
            text: 'copy [MARRAY] [SHALLOWORDEEP]',
            ...jwArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              SHALLOWORDEEP: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'shallow',
                menu: 'shallowOrDeep',
              },
            },
          },
          {
            opcode: 'freeze',
            text: 'freeze [MARRAY] [SHALLOWORDEEP]',
            ...jwArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              SHALLOWORDEEP: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'shallow',
                menu: 'shallowOrDeep',
              },
            },
          },
          {
            opcode: 'unfreeze',
            text: 'unfreeze [ARRAY] [SHALLOWORDEEP]',
            ...MArray.Block,
            arguments: {
              ARRAY: jwArray.Argument,
              SHALLOWORDEEP: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'shallow',
                menu: 'shallowOrDeep',
              },
            },
          },
          
          '---',

          // FULL ARRAY NON-MUTATING OPERATIONS

          {
            opcode: 'merge',
            text: 'combine [MARRAY] and [EXTENSION]',
            ...MArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              EXTENSION: MArray.Argument,
            },
          },
          {
            opcode: 'map',
            text: 'map [LAMBDA] over [MARRAY]',
            ...MArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              LAMBDA: jwLambda.Argument,
            },
          },
          {
            opcode: 'sliceStart',
            text: 'slice [MARRAY] from [START]',
            ...MArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              START: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 2,
              },
            },
          },
          {
            opcode: 'sliceStop',
            text: 'slice [MARRAY] to [STOP]',
            ...MArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              STOP: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 2,
              },
            },
          },
          {
            opcode: 'sliceStartStop',
            text: 'slice [MARRAY] from [START] to [STOP]',
            ...MArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              START: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 1,
              },
              STOP: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 2,
              },
            },
          },
          {
            opcode: 'sliceStartStopStep',
            text: 'slice [MARRAY] from [START] to [STOP] with step [STEP]',
            ...MArray.Block,
            arguments: {
              MARRAY: MArray.Argument,
              START: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 1,
              },
              STOP: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 2,
              },
              STEP: {
                type: Scratch.ArgumentType.NUMBER,
                exemptFromNormalization: true,
                defaultValue: 1,
              }
            },
          },

          '---',

          // STRINGS

          {
            opcode: 'split',
            text: 'split [STRING] by [DELIMITER]',
            ...MArray.Block,
            arguments: {
              STRING: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: 'foo,bar,baz',
              },
              DELIMITER: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: ',',
              },
            },
          },
          {
            opcode: 'join',
            text: 'join [MARRAY] with [DELIMITER]',
            blockType: Scratch.BlockType.REPORTER,
            arguments: {
              MARRAY: MArray.Argument,
              DELIMITER: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: ',',
              },
            },
          },

          '---',

          // CONVERSION

          {
            opcode: 'serialize',
            text: 'serialize [MARRAY]',
            ...dogeiscutObject.Block,
            arguments: {
              MARRAY: MArray.Argument,
            },
          },
          {
            opcode: 'unserialize',
            text: 'unserialize [SERIALIZED]',
            ...MArray.Block,
            arguments: {
              SERIALIZED: dogeiscutObject.Argument,
            },
          },

          '---',

          // REDUCE OPERATIONS


          {
            opcode: 'isCyclical',
            text: '[MARRAY] has a cyclical reference?',
            blockType: Scratch.BlockType.BOOLEAN,
            arguments: {
              MARRAY: MArray.Argument,
            },
          },
          {
            opcode: 'reduce',
            text: 'reduce [MARRAY] by [LAMBDA] with initial [VALUE]',
            blockType: Scratch.BlockType.REPORTER,
            allowDropAnywhere: true,
            arguments: {
              MARRAY: MArray.Argument,
              LAMBDA: jwLambda.Argument,
              VALUE: {
                type: Scratch.ArgumentType.STRING,
                exemptFromNormalization: true,
                defaultValue: '1',
              },
            },
          },

        ],
        menus: {
          stringifyType: {
            acceptReporters: false,
            items: [
              'compact',
              'pretty',
            ],
          },
          shallowOrDeep: {
            acceptReporters: false,
            items: [
              'shallow',
              'deep',
            ],
          }
        }
      };
    }

    static getCompileInfo() {
      return {
        ir: {

          newEmpty(generator, block) {
            return {
              kind: 'input',
            };
          },

          newNullFilled(generator, block) {
            return {
              kind: 'input',
              args: {
                LENGTH: generator.descendInputOfBlock(block, 'LENGTH'),
              },
            };
          },

          newFilled(generator, block) {
            return {
              kind: 'input',
              args: {
                LENGTH: generator.descendInputOfBlock(block, 'LENGTH'),
                VALUE: generator.descendInputOfBlock(block, 'VALUE'),
              },
            };
          },

          parse(generator, block) {
            return {
              kind: 'input',
              args: {
                VALUE: generator.descendInputOfBlock(block, 'VALUE'),
              },
            };
          },



          get(generator, block) {
            return {
              kind: 'input',
              args: {
                MARRAY: generator.descendInputOfBlock(block, 'MARRAY'),
                INDEX: generator.descendInputOfBlock(block, 'INDEX'),
              },
            };
          },

          length(generator, block) {
            return {
              kind: 'input',
              args: {
                MARRAY: generator.descendInputOfBlock(block, 'MARRAY'),
              },
            };
          },



          append(generator, block) {
            return {
              kind: 'stack',
              args: {
                MARRAY: generator.descendInputOfBlock(block, 'MARRAY'),
                VALUE: generator.descendInputOfBlock(block, 'VALUE'),
              },
            };
          },



          isMArray(generator, block) {
            return {
              kind: 'input',
              args: {
                VALUE: generator.descendInputOfBlock(block, 'VALUE'),
              },
            };
          },



          split(generator, block) {
            return {
              kind: 'input',
              args: {
                STRING: generator.descendInputOfBlock(block, 'STRING'),
                DELIMITER: generator.descendInputOfBlock(block, 'DELIMITER'),
              },
            };
          },

          builder(generator, block) {
            generator.script.yields = true
            return {
              kind: 'input',
              substacks: {
                SUBSTACK: generator.descendSubstack(block, 'SUBSTACK'),
              },
            };
          },

          builderCurrent(generator, block) {
            return {
              kind: 'input',
            };
          },

          for(generator, block) {
            generator.script.yields = true;
            return {
              kind: 'stack',
              args: {
                MARRAY: generator.descendInputOfBlock(block, 'MARRAY'),
              },
              substacks: {
                SUBSTACK: generator.descendSubstack(block, 'SUBSTACK'),
              },
            };
          },

          forIndex(generator, block) {
            return {
              kind: 'input',
            };
          },

          forValue(generator, block) {
            return {
              kind: 'input',
            };
          },

          id(generator, block) {
            return {
              kind: 'input',
              args: {
                MARRAY: generator.descendInputOfBlock(block, 'MARRAY'),
              },
            };
          },
        },
        js: {

          newEmpty(node, compiler, imports) {
            let source = '';
            source += `(`;

            source += `new vm.dvSoupMArray.Type()`;

            source += `)`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          newNullFilled(node, compiler, imports) {
            let source = '';
            source += `(`;

            source += `new vm.dvSoupMArray.Type(Array(`;
            source += `Math.max(Math.floor(${compiler.descendInput(node.args.LENGTH).asNumber()}), 0)`;
            source += `).fill(null))`;

            source += `)`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          newFilled(node, compiler, imports) {
            let source = '';
            source += `(`;

            source += `new vm.dvSoupMArray.Type(Array(`;
            source += `Math.max(Math.floor(${compiler.descendInput(node.args.LENGTH).asNumber()}), 0)`;
            source += `).fill(${compiler.descendInput(node.args.VALUE).asUnknown()}))`;

            source += `)`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          parse(node, compiler, imports) {
            let source = '';

            source += `vm.dvSoupMArray.Type.toMArray(${compiler.descendInput(node.args.VALUE).asUnknown()})`;

            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },



          get(node, compiler, imports) {
            let source = '';
            source += compiler.script.yields ? `(yield* (function*(){` : `(function(){`;

            let MARRAY = compiler.localVariables.next();
            source += `let ${MARRAY} = vm.dvSoupMArray.Type.toMArray(${compiler.descendInput(node.args.MARRAY).asUnknown()});`;
            source += `if (${MARRAY}.length === 0) return '';`;

            source += `return ${MARRAY}.array[`;
            source += `vm.dvSoupMutableUtil.mod(Math.floor(${compiler.descendInput(node.args.INDEX).asNumber()}) - 1, ${MARRAY}.length)`
            source += `];`;

            source += compiler.script.yields ? `})())` : `})()`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          length(node, compiler, imports) {
            let source = '';

            source += `vm.dvSoupMArray.Type.toMArray(${compiler.descendInput(node.args.MARRAY).asUnknown()}).length`;

            return new imports.TypedInput(source, imports.TYPE_NUMBER);
          },



          append(node, compiler, imports) {
            compiler.source += `vm.dvSoupMArray.Type.toMArray(${compiler.descendInput(node.args.MARRAY).asUnknown()})`
            compiler.source += `.push(${compiler.descendInput(node.args.VALUE).asUnknown()});`;
          },



          isMArray(node, compiler, imports) {
            let source = '';
            source += `(`;

            source += `${compiler.descendInput(node.args.VALUE).asUnknown()} instanceof vm.dvSoupMArray.Type`;

            source += `)`;
            return new imports.TypedInput(source, imports.TYPE_BOOLEAN);
          },



          split(node, compiler, imports) {
            let source = '';
            source += `(`;

            source += `new vm.dvSoupMArray.Type(${compiler.descendInput(node.args.STRING).asString()}.split(${compiler.descendInput(node.args.DELIMITER).asString()}))`;

            source += `)`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          builder(node, compiler, imports) {
            let source = '';
            source += compiler.script.yields ? `(yield* (function*(){` : `(function(){`;
            
            source += `thread.dvSoupMArrayBuilderVal ??= [];`;
            source += `thread.dvSoupMArrayBuilderVal.push(new vm.dvSoupMArray.Type());`;
            source += descendStackInline(compiler, node.substacks.SUBSTACK, new imports.Frame(false, 'dvSoupMArrays.builder'));
            source += `return thread.dvSoupMArrayBuilderVal.pop();`;
            
            source += compiler.script.yields ? `})())` : `})()`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          builderCurrent(node, compiler, imports) {
            let source = '';
            source += compiler.script.yields ? `(yield* (function*(){` : `(function(){`;
            
            let currentArraysStack = compiler.localVariables.next();
            source += `let ${currentArraysStack} = thread.dvSoupMArrayBuilderVal ?? [];`;
            source += `return ${currentArraysStack}[${currentArraysStack}.length - 1] ?? new vm.dvSoupMArray.Type();`;
            
            source += compiler.script.yields ? `})())` : `})()`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          for(node, compiler, imports) {
            compiler.source += compiler.script.yields ? `(yield* (function*(){` : `(function(){`;
            compiler.source += `vm.dvSoupMArrays.Type.toMArray(${compiler.descendInput(node.args.MARRAY).asUnknown()})`;
            const value = compiler.localVariables.next();
            const index = compiler.localVariables.next();
            compiler.source += `.forEach((${value}, ${index}) => {`;
            
            compiler.source += `thread._dvSoupMArraysForIndex = ${index};`;
            compiler.source += `thread._dvSoupMArraysForValue = ${value};`;
            compiler.source += descendStackInline(compiler, node.substacks.SUBSTACK, new imports.Frame(true, 'dvSoupMArrays.for'));
            
            compiler.source += `});`;
          },

          forIndex(node, compiler, imports) {
            let source = '';
            source += `(`;
            
            source += `thread._dvSoupMArraysForIndex ?? ''`;
            
            source += `)`;
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },

          forValue(node, compiler, imports) {
            let source = '';
            source += `(`;
            
            source += `thread._dvSoupMArraysForValue ?? 0`;
            
            source += `)`;
            return new imports.TypedInput(source, imports.TYPE_NUMBER);
          },

          id(node, compiler, imports) {
            let source = '';
            
            source += `vm.dvSoupMArray.Type.toMArray(${compiler.descendInput(node.args.MARRAY).asUnknown()}).id`;
            
            return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
          },
        },
      };
    }
  }

  // Validate environment
  let canLoad = false;
  if (Array.from(vm.extensionManager._loadedExtensions.keys()).includes('dvSoupMArrays')) {
    console.warn('Soup and Devmations\' Mutable Arrays extension attempted to be loaded while already present in the project; ignoring');
  } else {
    if (Scratch.extensions.isPenguinMod /* && !Scratch.extensions.isDinosaurMod */) {
      if (Scratch.extensions.unsandboxed) {
        canLoad = true;
      } else {
        alert('Please load Mutable Arrays unsandboxed.');
        console.error('[Mutable Arrays] Extension attempted to be loaded sandboxed');
      }
    } else {
      alert('Mutable Arrays only supports PenguinMod.');
      console.error('[Mutable Arrays] Extension attempted to be loaded outside of PenguinMod');
    }
  }
  if (!canLoad) {
    return;
  }

  // Load extension
  (async function() {
    console.log('[Mutable Arrays] Loading dependencies...');

    try {
      let externalExtSources = [];

      // Dependencies
      if (!vm.jwArray) vm.extensionManager.loadExtensionIdSync('jwArray');
      if (!vm.dogeiscutObject) externalExtSources.push(await getExtensionURL('https://extensions.penguinmod.com/extensions/DogeisCut/dogeiscutObject.js'));
      if (!vm.jwLambda) vm.extensionManager.loadExtensionIdSync('jwLambda');

      for (let source of externalExtSources) {
        eval(source);
      }

      // Dependency custom types
      jwArray = vm.jwArray;
      dogeiscutObject = vm.dogeiscutObject;
      jwLambda = vm.jwLambda;
      MObjectType = vm?.dvSoupMObject?.Type ?? null;
    } catch (error) {
      alert(`Failed to load dependencies for Mutable Arrays: ${error.message}`);
      console.error('Failed to load dependencies for Mutable Arrays:\n', error);
      return;
    }

    console.log('[Mutable Arrays] Loading...');

    Scratch.extensions.register(new MArraysExtension());

    console.log('[Mutable Arrays] Loaded!');
  })();

})(Scratch);
