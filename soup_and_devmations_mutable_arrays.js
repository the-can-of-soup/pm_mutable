// Name: Mutable Arrays
// ID: dvSoupMArrays
// Description: Combine all of the benefits of Lists and Arrays, and more! Supports infinite recursion and has cross-compat with Arrays and Iterators.
// By: the-can-of-soup and DashDevmationsDash
// License: MIT

(function(Scratch) {
	'use strict';

	const loopIcon = './static/blocks-media/repeat.svg';

	const vm = Scratch.vm;
	const runtime = vm.runtime;

	let jwArray;
	let dogeiscutObject;
	let jwLambda;

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

  function trueSign(n) {
  	// The `1 / n < 0` expression catches -0.
  	return (n < 0 || 1 / n < 0) ? -1 : 1;
  }

  function mod(n, m = 1) {
  	if (trueSign(n) === -1) {
  		return (m - Math.abs(n % m)) % m;
  	} else {
  		return n % m;
  	}
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

  class Util {
  	static vm = vm;
  	static runtime = runtime;

  	static uid = uid;
  	static escapeHTML = escapeHTML;
  	static trueSign = trueSign;
  	static mod = mod;
  }

	class MArrayType {
		// PenguinMod
		customId = 'dvSoupMArray';
		_monitorUpToDate = true;

		// Custom
		id = null;
		array = null;
		_toListEditorLastResult = null;

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
			this.id = uid();
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
			return document.createElement('span'); // @TODO
		}

		toMonitorContent() {
			this._monitorUpToDate = true;
			return this.toReporterContent(); // @TODO
		}

		toListItem() {
			this._monitorUpToDate = true;
			return this.toMonitorContent(); // @TODO
		}

		pokeMonitor() {
			this._monitorUpToDate = false;
		}

		jwArrayHandler() {
			return `<span style="color: #ff3d6e">M</span>Array${escapeHTML(`<${this.length}>`)}`;
		}

		dogeiscutObjectHandler() {
			return '<i>TODO</i>'; // @TODO
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

		get length() {
			return this.array.length;
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
			vm.dvSoupMArraysUtil = Util;

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
					{
						opcode: 'isCyclical',
						text: '[MARRAY] has infinite recursion?',
						blockType: Scratch.BlockType.BOOLEAN,
						arguments: {
							MARRAY: MArray.Argument,
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
					},
				},
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
							substack: generator.descendSubstack(block, 'SUBSTACK')
						}
					},

					builderCurrent(generator, block) {
						return {
							kind: 'input'
						}
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

						source += `return new vm.dvSoupMArray.Type(Array(`;
						source += `Math.max(Math.floor(${compiler.descendInput(node.args.LENGTH).asNumber()}), 0)`;
						source += `).fill(null));`;

						source += `)`;
						return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
					},

					newFilled(node, compiler, imports) {
						let source = '';
						source += `(`;

						source += `return new vm.dvSoupMArray.Type(Array(`;
						source += `Math.max(Math.floor(${compiler.descendInput(node.args.LENGTH).asNumber()}), 0)`;
						source += `).fill(${compiler.descendInput(node.args.VALUE).asUnknown()}));`;

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
						source += `vm.dvSoupMArraysUtil.mod(Math.floor(${compiler.descendInput(node.args.INDEX).asNumber()}), ${MARRAY}.length)`
						source += `];`;

						source += compiler.script.yields ? `})())` : `})()`;
						return new imports.TypedInput(source, imports.TYPE_UNKNOWN);
					},

					length(node, compiler, imports) {
						let source = '';

						source += `vm.dvSoupMArray.Type.toMArray(${compiler.descendInput(node.args.MARRAY).asUnknown()}).length`;

						return new imports.TypedInput(source, imports.TYPE_NUMBER);
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
						const src = compiler.source
						compiler.source = 'vm.dvSoupMArray.Type.toMArray(yield* (function*() {'
						compiler.source += `thread._dvSoupMArrayBuilderVal ?? = [];`
						compiler.source += `thread._dvSoupMArrayBuilderVal.push([]);`
						compiler.descendStack(node.substack, new imports.Frame(false, undefined, true));
						compiler.source += `return thread._dvSoupMArrayBuilderVal.pop();`
						compiler.source += `})())`;
						const typedinput = compiler.source
						compiler.source = src
						return new imports.TypedInput(typedinput, imports.TYPE_UNKNOWN)
					},

					builderCurrent(node, compiler, imports) {
						let src = 'let d = thread._dvSoupMArrayBuilderVal ?? [];'
						src += 'let v = d[d.length - 1];'
						src += 'return vm.dvSoupMArray.Type.toMArray(v ? v : [])'
						return new imports.TypedInput(src, imports.TYPE_UNKNOWN)
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
        alert('Please load Soup and Devmations\' Mutable Arrays unsandboxed.');
        throw new Error('Soup and Devmations\' Mutable Arrays extension attempted to be loaded sandboxed');
      }
    } else {
      alert('Soup and Devmations\' Mutable Arrays only supports PenguinMod.');
      throw new Error('Soup and Devmations\' Mutable Arrays extension attempted to be loaded outside of PenguinMod');
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
  	} catch (error) {
  		alert(`Failed to load dependencies for Soup and Devmations\' Mutable Arrays: ${error.message}`);
			console.error('Failed to load dependencies for Soup and Devmations\' Mutable Arrays:');
			throw error;
  	}

  	console.log('[Mutable Arrays] Loading...');

  	Scratch.extensions.register(new MArraysExtension());

  	console.log('[Mutable Arrays] Loaded!');
  })();

})(Scratch);
