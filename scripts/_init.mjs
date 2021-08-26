// CORE MODULE IMPORT
import { MODULE } from './_module.mjs';

// IMPORT SETTINGS -> Settings Register on Hooks.Setup
import './_settings.mjs';

// IMPORT MODULE FUNCTIONALITY
import LibThemerES from './lib-themer.mjs';

Hooks.once('ready', () => { LibThemerES.init(); });



// Patch Foundry
//Hooks.on('libWrapper.Ready', async () => {
	function _reallyMergeInsert(original, k, v, {insertKeys, insertValues}={}, _d) {
		// Recursively create simple objects
		if ( v?.constructor === Object && insertKeys) {
			original[k] = mergeObject({}, v, {insertKeys: true, inplace: true});
			return;
		}

		// Delete a key
		if ( k.startsWith("-=") ) {
			delete original[k.slice(2)];
			return;
		}

		// Insert a key
		const canInsert = ((_d <= 1) && insertKeys) || ((_d > 1) && insertValues );
		if ( canInsert ) original[k] = v;	
	}
	function _reallyMergeUpdate(original, k, v, {insertKeys, insertValues, enforceTypes, overwrite, recursive}={}, _d) {
		const x = original[k];
		const tv = getType(v);
		const tx = getType(x);
	  
		// Recursively merge an inner object
		if ( (tv === "Object") && (tx === "Object") && recursive) {
		  return myMergeObject(x, v, {
			insertKeys: insertKeys,
			insertValues: insertValues,
			overwrite: overwrite,
			inplace: true,
			enforceTypes: enforceTypes
		  }, _d);
		}
	  
		// Overwrite an existing value
		if ( overwrite ) {
		  if ( (tx !== "undefined") && (tv !== tx) && enforceTypes ) {
			throw new Error(`Mismatched data types encountered during object merge.`);
		  }
		  original[k] = v;
		}
	  }

	function myMergeObject(original, other={}, {
		insertKeys=true, insertValues=true, overwrite=true, recursive=true, inplace=true, enforceTypes=false
	  }={}, _d=0) {
		other = other || {};
		if (!(original instanceof Object) || !(other instanceof Object)) {
		  throw new Error("One of original or other are not Objects!");
		}
		const options = {insertKeys, insertValues, overwrite, recursive, inplace, enforceTypes};
	  
		// Special handling at depth 0
		if ( _d === 0 ) {
		  if ( !inplace ) original = deepClone(original);
		  if ( Object.keys(original).some(k => /\./.test(k)) ) original = expandObject(original);
		  if ( Object.keys(other).some(k => /\./.test(k)) ) other = expandObject(other);
		}
	  
		// Iterate over the other object
		for ( let k of Object.keys(other) ) {
		  const v = other[k];
		  if ( original.hasOwnProperty(k) ) _reallyMergeUpdate(original, k, v, options, _d+1);
		  else _reallyMergeInsert(original, k, v, options, _d+1);
		}
		return original;
	}

	globalThis.myMergeObject = myMergeObject;

	/*libWrapper.register(MODULE.name, 'foundry.utils.mergeObject', function(original, other={}, {
		insertKeys=true, insertValues=true, overwrite=true, recursive=true, inplace=true, enforceTypes=false
	  }={}, _d=0) {
		other = other || {};
		if (!(original instanceof Object) || !(other instanceof Object)) {
		  throw new Error("One of original or other are not Objects!");
		}
		const options = {insertKeys, insertValues, overwrite, recursive, inplace, enforceTypes};
	  
		// Special handling at depth 0
		if ( _d === 0 ) {
		  if ( !inplace ) original = deepClone(original);
		  if ( Object.keys(original).some(k => /\./.test(k)) ) original = expandObject(original);
		  if ( Object.keys(other).some(k => /\./.test(k)) ) other = expandObject(other);
		}
	  
		// Iterate over the other object
		for ( let k of Object.keys(other) ) {
		  const v = other[k];
		  if ( original.hasOwnProperty(k) ) _mergeUpdate(original, k, v, options, _d+1);
		  else _reallyMergeInsert(original, k, v, options, _d+1);
		}
		return original;
	}, 'OVERRIDE');*/
//});
