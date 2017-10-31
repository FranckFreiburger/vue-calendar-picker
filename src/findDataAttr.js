function camelize(str) {

	return str.replace(/-./g, function(str) { return str.charAt(1).toUpperCase() });	
}

var dataset = function(elt) {

	if ( 'dataset' in HTMLElement.prototype ) {

		dataset = function(elt) {
			
			return elt.dataset;
		}
	} else {

		dataset = function(elt) {

			var data = {};
			for ( var i = 0; i < elt.attributes.length; ++i ) {

				var attribute = elt.attributes[i];
				if ( attribute.name.substr(0, 5) === 'data-' )
					data[camelize(attribute.name.substr(5))] = attribute.value;
			}
			return data;
		}
	}
	return dataset(elt);
}

export default function(elt, rootElt) {
	
	var dataAttrMap = {};
	for ( ; elt !== rootElt && elt !== null; elt = elt.parentNode )
		if ( elt.nodeType === 1 ) {

			var data = dataset(elt);
			for ( var propName in data )
				dataAttrMap[propName] = data[propName];
		}
	return dataAttrMap;
}
