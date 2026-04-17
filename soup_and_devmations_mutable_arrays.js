// Name: Mutable Arrays
// ID: dvSoupMArrays
// Description: Combine all of the benefits of Lists and Arrays, and more! Supports infinite recursion and has cross-compat with Arrays and Iterators.
// By: the-can-of-soup and DashDevmationsDash
// License: MIT

(function(Scratch) {
	'use strict';

	const vm = Scratch.vm;
	const runtime = vm.runtime;

	let jwLambda;
	let divIterator;

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
  	// The `1 / result < 0` expression catches -0.
  	return (result < 0 || 1 / result < 0) ? -1 : 1;
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
			return `Mutable Array<${this.length}>`; // @TODO
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
			// Register compiled blocks
			// @TODO

			// Register mutable array type
			vm.MArray = MArray;
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
						opcode: 'isMArray',
						text: '[VALUE] is a mutable array?',
						blockType: Scratch.BlockType.BOOLEAN,
						arguments: {
							VALUE: EmptyArgument,
						},
					},

					'---',

					// BUILDER

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

					'---',

					// GETTERS

					{
						opcode: 'length',
						text: 'length of [MARRAY]',
						blockType: Scratch.BlockType.REPORTER,
						arguments: {
							MARRAY: MArray.Argument,
						},
					},
					{
						opcode: 'get',
						text: 'get [INDEX] in [MARRAY]',
						blockType: Scratch.BlockType.REPORTER,
						arguments: {
							INDEX: {
								type: Scratch.ArgumentType.NUMBER,
								exemptFromNormalization: true,
								defaultValue: 1,
							},
							MARRAY: MArray.Argument,
						},
					},
					
					'---',

					// FULL ARRAY OPERATIONS

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

				],
			};
		}

		newEmpty() {
			return new MArrayType();
		}

		newNullFilled({LENGTH}) {
			LENGTH = Scratch.Cast.toNumber(LENGTH);
			LENGTH = Math.max(Math.floor(LENGTH), 0);

			return new MArrayType(Array(LENGTH).fill(null));
		}

		newFilled({LENGTH, VALUE}) {
			return new MArrayType(Array(LENGTH).fill(LENGTH));
		}

		parse({VALUE}) {
			return MArrayType.toMArray(VALUE);
		}

		split({STRING, DELIMITER}) {
			STRING = Scratch.Cast.toString(STRING);
			DELIMITER = Scratch.Cast.toString(DELIMITER);

			return new MArrayType(STRING.split(DELIMITER));
		}

		isMArray({VALUE}) {
			return VALUE instanceof MArrayType;
		}

		length({MARRAY}) {
			return MArrayType.toMArray(MARRAY).length;
		}

		get({MARRAY, INDEX}) {
			MARRAY = MArrayType.toMArray(MARRAY);
			if (MARRAY.length === 0) return '';
			INDEX = Scratch.Cast.toNumber(INDEX);

			INDEX = mod(Math.floor(INDEX), MARRAY.length);
			return MARRAY.array[INDEX];
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
			if (!vm.jwLambda) vm.extensionManager.loadExtensionIdSync('jwLambda');
      if (!vm.divIterator) externalExtSources.push(await getExtensionURL('https://extensions.penguinmod.com/extensions/Div/divIterators.js'));

      for (let source of externalExtSources) {
      	eval(source);
      }

      // Dependency custom types
			jwLambda = vm.jwLambda;
			divIterator = vm.divIterator;
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
