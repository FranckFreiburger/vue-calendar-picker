var isEq = require('./isEq.js');

var df = require('date-fns'); // https://date-fns.org

var PERIOD = require('./period.js');


function onpointer() {
	
	function hasKeyActive(ev) {
		
		return ev.shiftKey || ev.ctrlKey || ev.altKey || ev.metaKey;
	}


	function touchStartHandler(cx, ev) {

		cx.callback({ eventType:'down', eventTarget:ev.target, pointerActive:true, keyActive:false});
		
		cx._pressTimeout = setTimeout(function() {
		
			cx.callback({ eventType:'press', eventTarget:ev.target, pointerActive:true, keyActive:false});
		}, 1000);
	}
	
	function touchEndHandler(cx, ev) {

		if ( cx._pressTimeout !== undefined ) {
			
			clearTimeout(cx._pressTimeout);
			cx._pressTimeout = undefined;
		}

		cx.callback({ eventType:'up', eventTarget:ev.target, pointerActive:false, keyActive:false});
	}

	function touchMoveHandler(cx, ev) {
		
		if ( cx._pressTimeout !== undefined ) {
			
			clearTimeout(cx._pressTimeout);
			cx._pressTimeout = undefined;
		}
		
		ev.preventDefault();
		var eventTarget = document.elementFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
		cx.callback({ eventType:'over', eventTarget:eventTarget, pointerActive:true, keyActive:false});
	}
	
	function clickHandler(cx, ev) {
		
		cx.callback({ eventType:'tap', eventTarget:ev.target, pointerActive:false, keyActive:hasKeyActive(ev)});
	}
	
	function dblclickHandler(cx, ev) {
		
		cx.callback({ eventType:'press', eventTarget:ev.target, pointerActive:false, keyActive:hasKeyActive(ev)});
	}
	
	function mouseOverHandler(cx, ev) {

		cx.callback({ eventType:'over', eventTarget:ev.target, pointerActive:cx.buttonState, keyActive:hasKeyActive(ev)});
	}
	
	function mouseDownHandler(cx, ev) {

		cx.callback({ eventType:'down', eventTarget:ev.target, pointerActive:true, keyActive:hasKeyActive(ev)});
	}
	
	function mouseUpHandler(cx, ev) {

		cx.callback({ eventType:'up', eventTarget:ev.target, pointerActive:false, keyActive:hasKeyActive(ev)});
	}
	
	
	function eventListener(el, eventName, handler) {
		
		el.addEventListener(eventName, handler);
		return el.removeEventListener.bind(el, eventName, handler);
	}

	return {
		bind: function(el, binding, vnode, oldVnode) {
			
			var cx = {
				el: el,
				callback: binding.value,
				offEvent: []
			}
			
			cx.offEvent.push( eventListener(el, 'click', clickHandler.bind(this, cx)) );
			cx.offEvent.push( eventListener(el, 'dblclick', dblclickHandler.bind(this, cx)) );
			cx.offEvent.push( eventListener(el, 'mouseover', mouseOverHandler.bind(this, cx)) );
			cx.offEvent.push( eventListener(el, 'mousedown', mouseDownHandler.bind(this, cx)) );
			cx.offEvent.push( eventListener(el, 'mouseup', mouseUpHandler.bind(this, cx)) );

			// IE9 does not update ev.buttons on mouseover event
			cx.offEvent.push( eventListener(document, 'mousedown', function(ev) { cx.buttonState = true } ) );
			cx.offEvent.push( eventListener(document, 'mouseup', function(ev) { cx.buttonState = false } ) );

			// touch screen
			cx.offEvent.push( eventListener(el, 'touchstart', touchStartHandler.bind(this, cx)) );
			cx.offEvent.push( eventListener(el, 'touchmove', touchMoveHandler.bind(this, cx)) );
			cx.offEvent.push( eventListener(el, 'touchend', touchEndHandler.bind(this, cx)) );
			
			// for IE9
			cx.offEvent.push( eventListener(el, 'selectstart', function(ev) { ev.preventDefault() } ) );

			el._onpointerCx = cx;
		},
		unbind: function(el, binding, vnode, oldVnode) {
			
			var cx = el._onpointerCx;
			while ( cx.offEvent.length !== 0 )
				cx.offEvent.pop()();
			el._onpointerCx = null;
		}
	}
}

function data(el, binding) {

	if ( isEq(binding.value, binding.oldValue) )
		return;
	// IE[9, 10] does not reflect dataset into dom attributes.
	//el.dataset[binding.arg] = binding.modifiers.json === true ? JSON.stringify(binding.value) : String(binding.value);
	el.setAttribute('data-'+binding.arg, binding.modifiers.json === true ? JSON.stringify(binding.value) : String(binding.value));
}


module.exports = {
	directives: {
		data: data,
		onpointer: onpointer(),
	},
	
	props: {
		locale: {
			type: String,
			default: (navigator.language || navigator.userLanguage).substr(0,2).toUpperCase(),
			validator: function(value) {
				
				return value === value.toUpperCase();
			}
		},
		compact: {
			type: Boolean,
			default: false,
		},
		
		itemClass: {
			type: Function,
			default: function() {},
		},

	},
	computed: {
		dateFnsLocale: function() {
			
			return require('date-fns/locale/'+this.locale.toLowerCase()+'/index.js');
		},

		firstDayOfTheWeek: function() {
					
			if (' GB AG AR AS AU BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IE IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP NZ PA PE PH PK PR PY SA SG SV TH TN TT TW UM US VE VI WS YE ZA ZW '.indexOf(' '+this.locale+' ') !== -1 )
				return 0; // sun
			if (' AE AF BH DJ DZ EG IQ IR JO KW LY MA OM QA SD SY '.indexOf(' '+this.locale+' ') !== -1 )
				return 6; // sat
			if (' BD MV '.indexOf(' '+this.locale+' ') !== -1 )
				return 5; // fri
			return 1; // mon
		},

		dfOptions: function() {
			return { weekStartsOn: this.firstDayOfTheWeek };
		},
		
	},
	methods: {
		format: function(date, format) {

			return df.format(date, format, { locale: this.dateFnsLocale });
		},
		
		dateAdd: function(date, type, count) {
			
			switch ( type ) {
				case PERIOD.MINUTE: return df.addMinutes(date, count);
				case PERIOD.HOUR: return df.addHours(date, count);
				case PERIOD.DAY: return df.addDays(date, count);
				case PERIOD.WEEK: return df.addWeeks(date, count);
				case PERIOD.MONTH: return df.addMonths(date, count);
				case PERIOD.YEAR: return df.addYears(date, count);
				case PERIOD.DECADE: return df.addYears(date, 16 * count);
			}
		},
		
		getItemRange: function(date, type) {
			
			switch ( type ) {
				case PERIOD.MINUTE: return { start: df.startOfMinute(date), end: df.startOfMinute(df.addMinutes(date, 1)) };
				case PERIOD.HOUR: return { start: df.startOfHour(date), end: df.startOfHour(df.addHours(date, 1)) };
				case PERIOD.DAY: return { start: df.startOfDay(date), end: df.startOfDay(df.addDays(date, 1)) };
				case PERIOD.WEEK: return { start: df.startOfWeek(date, this.dfOptions), end: df.startOfWeek(df.addWeeks(date, 1), this.dfOptions) };
				case PERIOD.MONTH: return { start: df.startOfMonth(date), end: df.startOfMonth(df.addMonths(date, 1)) };
				case PERIOD.YEAR: return { start: df.startOfYear(date), end: df.startOfYear(df.addYears(date, 1)) };
			}
		},
		
	},
	
	created: function() {
		
		this.df = df;
		this.PERIOD = PERIOD;
	}
	
}
