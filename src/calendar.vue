<template>
	<div class="calendar" :class="{ compact: compact }" v-onpointer="pointerEvent">
		<div class="nav">
			<span class="prev" data-nav="-1"></span>

			<span v-if="view <= VIEW.YEAR" @click="view = VIEW.DECADE" v-text="df.getYear(current)"></span>
			<span v-if="view <= VIEW.MONTH" @click="view = VIEW.YEAR" v-text="format(current, 'MMM')"></span>
			<span v-if="view === VIEW.WEEK" @click="view = VIEW.MONTH" v-text="'W'+df.getISOWeek(current)"></span>
			<span v-if="view <= VIEW.DAY" @click="view = VIEW.MONTH" v-text="df.getDate(current)"></span>
			<span v-if="view <= VIEW.HOUR" @click="view = VIEW.DAY">{{df.format(current, 'HH')}}<sup>h</sup></span>

			<span class="next" data-nav="1"></span>
		</div>
		<transition-group :name="animation" @after-enter="animation = ''" class="animation">

			<div v-if="view === VIEW.HOUR" class="view hourView timeVertical" :key="posId">
				<div v-for="y in 15">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df.setMinutes(current, (y-1) + (x-1)*15 ), 'minute')]"
							v-data:item.json="[+range.start/10000, 'minute']"
							:class="[ { this: df.isSameMinute(today, range.start) }, itemClass(range) ]"
						>
							<span class="cellHead">{{df.format(range.start, 'mm')}}</span>
							<slot :item-range="range" layout="vertical"></slot>
						</span>
					</template>
				</div>
			</div>

			<div v-if="view === VIEW.DAY" class="view dayView timeVertical" :key="posId">
				<div v-for="y in 12">
					<template v-for="x in 2">
						<span
							v-for="range in [getItemRange(df.setHours(current, (y-1) + (x-1)*12 ), 'hour')]"
							v-data:item.json="[+range.start/10000, 'hour']"
							:class="[ { this: df.isSameHour(today, range.start) }, itemClass(range) ]"
						>
							<span class="cellHead">{{df.format(range.start, 'HH')}}<sup>h</sup></span>
							<slot :item-range="range" layout="vertical"></slot>
						</span>
					</template>
				</div>
			</div>

			<div v-if="view === VIEW.WEEK" class="view weekView timeVertical" :key="posId">
				<div>
					<span></span>
					<template v-for="x in 7">
						<span
							v-for="arg in [df.addDays(df.startOfWeek(current, { weekStartsOn: firstDayOfTheWeek }), x-1)]"
							v-data:item.json="[+arg/10000, 'day']"
							:class="[ { this: df.isSameDay(today, arg) } ]"
						>{{format(arg, 'dd')}}<sub>{{df.getDate(arg)}}</sub></span>
					</template>
				</div>
				<div v-for="y in 24">
					<span v-text="y-1"></span>
					<template v-for="x in 7">
						<span
							v-for="range in [getItemRange(df.addHours(df.addDays(df.startOfWeek(current, { weekStartsOn: firstDayOfTheWeek }), x-1), y-1), 'hour')]"
							v-data:item.json="[+range.start/10000, 'hour']"
							:class="[ { thisMonth: df.isSameMonth(current, range.start) }, itemClass(range) ]"
						>
							<slot :item-range="range" layout="vertical"></slot>
						</span>
					</template>
				</div>
			</div>

			<div v-if="view === VIEW.MONTH" class="view monthView timeHorizontal" :key="posId">
				<div>
					<span v-if="!compact"></span>
					<span v-for="n in 7" v-text="format(df.setDay(current, firstDayOfTheWeek+n-1), compact ? 'dd' : 'ddd')"></span>
				</div>
				<div v-for="y in compact ? visibleWeeksCount : 6">
					<template v-for="week in [df.addDays(firstDayOfMonthView, (y-1) * 7)]">
						<span
							v-if="!compact"
							v-data:item.json="[+week/10000, 'week']"
							v-text="df.getISOWeek(week)"
						></span>
					</template>
					<template v-for="x in 7">
						<span
							v-for="range in [getItemRange(df.addDays(firstDayOfMonthView, (y-1) * 7 + (x-1)), 'day')]"
							v-data:item.json="[+range.start/10000, 'day']"
							:class="[ { this: df.isSameDay(today, range.start), notThisMonth: !df.isSameMonth(current, range.start) }, itemClass(range) ]"
						>
							<span class="cellHead" v-text="df.getDate(range.start)"></span>
							<slot :item-range="range" layout="horizontal"></slot>
						</span>
					</template>
				</div>
			</div>
			
			<div v-if="view === VIEW.YEAR" class="view yearView timeHorizontal" :key="posId">
				<div v-for="y in 3">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df.setMonth(current, (y-1)*4 + (x-1)), 'month')]"
							v-data:item.json="[+range.start/10000, 'month']"
							:class="[ { this: df.isSameMonth(today, range.start) }, itemClass(range) ]"
						>
							<span class="cellHead" v-text="format(range.start, compact ? 'MMM' : 'MMMM')"></span>
							<slot :item-range="range" layout="horizontal"></slot>
						</span>
					</template>
				</div>
			</div>

			<div v-if="view === VIEW.DECADE" class="view decadeView timeHorizontal" :key="posId">
				<div v-for="y in 4">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df.addYears(current, (y-1)*4 + (x-1) - 9), 'year')]"
							v-data:item.json="[+range.start/10000, 'year']"
							:class="[ { this: df.isSameYear(today, range.start) }, itemClass(range) ]"
						>
							<span class="cellHead" v-text="df.getYear(range.start)"></span>
						</span>
					</template>
				</div>
			</div>
		</transition-group>
	</div>
</template>

<style>

.calendar .forwardSlide-enter-active {
	position: absolute;
	animation: calendar-slide-out .5s ease;
}

.calendar .forwardSlide-leave-active {
	position: absolute;
	animation: calendar-slide-in .5s ease;
}

.calendar .reverseSlide-enter-active {
	position: absolute;
	animation: calendar-slide-in .5s ease-in reverse;
}

.calendar .reverseSlide-leave-active {
	position: absolute;
	animation: calendar-slide-out .5s ease-in reverse;
}

@keyframes calendar-slide-in {
	from {
		transform: translateX(0%);
		opacity: 1;
	}
	to {
		transform: translateX(-100%);
		opacity: 0;
	}
}

@keyframes calendar-slide-out {
	from {
		transform: translateX(100%);
		opacity: 0;
	}
	to {
		transform: translateX(0%);
		opacity: 1;
	}
}


.calendar .forwardScale-enter-active {
	position: relative;
	animation: calendar-scale-out .5s ease;
	transform-origin: 50% 50%;
}

.calendar .forwardScale-leave-active {
	position: absolute;
	animation: calendar-scale-in .5s ease;
	transform-origin: 50% 50%;
}

.calendar .reverseScale-enter-active {
	position: relative;
	animation: calendar-scale-in .5s ease-in reverse;
	transform-origin: 50% 50%;
}

.calendar .reverseScale-leave-active {
	position: absolute;
	animation: calendar-scale-out .5s ease-in reverse;
	transform-origin: 50% 50%;
}


@keyframes calendar-scale-in {
	from {
		transform: scale(1);
		opacity: 1;
	}
	to {
		transform: scale(0.5);
		opacity: 0;
	}
}

@keyframes calendar-scale-out {
	from {
		transform: scale(1.5);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}

.calendar .animation {
	display: block;
	position: relative;
	height: 100%;
	overflow: hidden;
}

.calendar {
	position: relative;
	
	width: 20em;
	height: 16em;
	
	font-family: arial;
	font-size: 90%;

	display: inline-block;
	cursor: default;
	user-select: none;
	padding-top: 2.5em;
}

.calendar.compact {
	padding-top: 1em;
}


/* nav */

.calendar .nav {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 2.5em;
	text-align: center;
}

.calendar .nav > span {
	box-sizing: border-box;
	display: inline-block;
	height: 100%;
	padding: 0.5em;
	cursor: pointer;
}

.calendar .nav .prev,
.calendar .nav .next {
	font-size: 150%;
	font-weight: bold;
	margin-top: -0.3em;
}

.calendar .nav .prev {
	float: left;
}

.calendar .nav .next {
	float: right;
}

.calendar .nav .prev:before {
	content: '\2190';
}

.calendar .nav .next:before {
	content: '\2192';
}


.calendar .compact .nav {
	height: 2em;
	margin-top: 0;
}

.calendar .compact .nav sup {
	vertical-align: initial;
}

.calendar .compact .nav > span {
	padding: 0;
}

.calendar .compact .nav .prev {
	left: 0.25em;
	text-align: left;
}

.calendar .compact .nav .next {
	right: 0.25em;
	text-align: right;
}


/* highlighting */

.calendar span[data-item]:hover {
	/*background-color: #eee;*/
	outline: 1px dotted #000;
	outline-offset: -1px;
}

.calendar .this {
	outline: 1px dotted #f55;
	outline-offset: -1px;
}


/* view */

.calendar .view {
	display: table;
	width: 100%;
	height: 100%;
	line-height: 1;
}

.calendar .view > div {
	display: table-row;
}

.calendar .view > div > span {
	display: table-cell;
	vertical-align: top;
}

.calendar .cellHead {
	vertical-align: top;
}


/* hour */

.hourView .cellHead {
	display: inline-block;
	width: 1em;
	font-size: 75%;
}


/* day */

.calendar .dayView .cellHead {
	margin-right: 0.5em;
	display: inline-block;
	width: 1.25em;
}


/* week */

.calendar .weekView > div > span {
	line-height: 0.5;
}

.calendar .weekView > div:nth-child(4n+1) > span {
	border-bottom: 1px dashed silver;
}

.calendar .weekView > div:first-child > span {
	width: 14%;
	padding: 0.2em;
	box-sizing: border-box;
}

.calendar .weekView > div > span:first-child {
	width: 1em;
	padding-right: 0.25em;
	text-align: right;
}

.calendar .weekView > div:nth-child(odd) > span:first-child {
	visibility: hidden;
}


/* month */

.calendar .monthView > div:first-child > span {
	height: 1em;
	padding: 0.25em;
	text-align: center;
}

.calendar:not(.compact) .monthView > div > span:first-child {
	text-align: center;
	font-weight: bold;
	padding-right: 0.25em;
}

.calendar .monthView .cellHead {
	text-align: center;
	display: block;
}

.calendar .monthView .notThisMonth .cellHead {
	color: silver;
}


/* yearView / decadeView */

.calendar .yearView > div > span,
.calendar .decadeView > div > span {
	text-align: center;
	vertical-align: middle;
}

.calendar .yearView .cellHead,
.calendar .decadeView .cellHead {
	padding: 0.2em;
}

</style>

<script>
"use strict";

var df = require('date-fns'); // https://date-fns.org


function findDataAttr(elt, rootElt) {
	
	var dataAttrMap = {};
	for ( ; elt !== rootElt && elt !== null; elt = elt.parentNode )
		if ( elt.nodeType === 1 )
			for ( var propName in elt.dataset )
				dataAttrMap[propName] = elt.dataset[propName];
	return dataAttrMap;
}

function isEq(val1, val2) {
	
	if ( val1 === val2 )
		return true;
	
	var type1 = typeof(val1);
	if ( type1 !== typeof(val2) )
		return false;

	if ( type1 === 'object' && val1 !== null && val2 !== null ) {
		
		var k1 = Object.keys(val1);
		var k1len = k1.length;
		if ( Object.keys(val2).length !== k1len )
			return false;

		for ( var i = 0; i < k1len; ++i )
			if ( !isEq(val1[k1[i]], val2[k1[i]]) )
				return false;
		return true;
	}
	return false;
}

var VIEW = {
	HOUR: 3,
	DAY: 4,
	WEEK: 5,
	MONTH: 6,
	YEAR: 7,
	DECADE: 8,
}


function onpointer() {
	
	function hasKeyActive(ev) {
		
		return ev.shiftKey || ev.ctrlKey || ev.altKey || ev.metaKey;
	}

	function hasPointerActive(ev) {

		return ev.buttons !== 0;
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

		cx.callback({ eventType:'over', eventTarget:ev.target, pointerActive:hasPointerActive(ev), keyActive:hasKeyActive(ev)});
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
				callback: binding.value
			}
			
			var offTouchstart = eventListener(el, 'touchstart', touchStartHandler.bind(this, cx));
			var offTouchmove = eventListener(el, 'touchmove', touchMoveHandler.bind(this, cx));
			var offTouchend = eventListener(el, 'touchend', touchEndHandler.bind(this, cx));
			var offClick = eventListener(el, 'click', clickHandler.bind(this, cx));
			var offDblclick = eventListener(el, 'dblclick', dblclickHandler.bind(this, cx));
			var offMouseover = eventListener(el, 'mouseover', mouseOverHandler.bind(this, cx));
			var offMousedown = eventListener(el, 'mousedown', mouseDownHandler.bind(this, cx));
			var offMouseup = eventListener(el, 'mouseup', mouseUpHandler.bind(this, cx));
			
			var offDragStart = eventListener(el, 'selectstart', function(ev) { ev.preventDefault() } ); // for IE9
			
			cx.removeListeners = function() {
				
				offTouchstart();
				offTouchmove();
				offTouchend();
				offClick();
				offDblclick();
				offMouseover();
				offMousedown();
				offMouseup();
				
				offDragStart();
			}
			
			el._onpointerCx = cx;
		},
		unbind: function(el, binding, vnode, oldVnode) {
			
			el._onpointerCx.removeListeners();
			el._onpointerCx = null;
		}
	}
}


module.exports = {
	
	directives: {
		data: function(el, binding) {

			if ( isEq(binding.value, binding.oldValue) )
				return;
			el.dataset[binding.arg] = binding.modifiers.json === true ? JSON.stringify(binding.value) : String(binding.value);
		},
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
			default: false
		},
		initialView: {
			type: Number,
			default: VIEW.MONTH,
		},
		initialCurrent: {
			type: Date,
			default: function() {
				return new Date
			}
		},
		itemClass: {
			type: Function,
			default: function() {},
		},
	},
	
	data: function() {
		return {
			animation: '',
			view: this.initialView,
			current: this.initialCurrent,
			today: new Date,
		}
	},

	watch: {
		current: function(val, prev) {
			
			if ( !df.isEqual(val, prev) )
				this.animation = df.isAfter(val, prev) ? 'forwardSlide' : 'reverseSlide';
		},
		view: function(val, prev) {
			
			if ( val !== prev )
				this.animation = val > prev ? 'forwardScale' : 'reverseScale';
		},
	},

	computed: {
		
		posId: function() {
			
			return String(this.view) + String(df.getTime(this.current));
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
		
		visibleWeeksCount: function() {

			return Math.ceil((df.getDaysInMonth(this.current) + df.getDay(df.startOfMonth(this.current)) ) / 7);
		},

		firstDayOfMonthView: function() {
			
			return df.setDay(df.startOfMonth(this.current), this.firstDayOfTheWeek);
		},
		
		dateFnsLocale: function() {
			
			return require('date-fns/locale/'+this.locale.toLowerCase()+'/index.js');
		}
	},
	
	methods: {
		format: function(date, format) {

			return df.format(date, format, { locale: this.dateFnsLocale });
		},
		
		getItemRange: function(date, type) {
			
			switch ( type ) {
				case 'minute':
					return { start: df.startOfMinute(date), end: df.startOfMinute(df.addMinutes(date, 1)) };
				case 'hour':
					return { start: df.startOfHour(date), end: df.startOfHour(df.addHours(date, 1)) };
				case 'day':
					return { start: df.startOfDay(date), end: df.startOfDay(df.addDays(date, 1)) };
				case 'week':
					var options = { weekStartsOn: this.firstDayOfTheWeek };
					return { start: df.startOfWeek(date, options), end: df.startOfWeek(df.addWeeks(date, 1), options) };
				case 'month':
					return { start: df.startOfMonth(date), end: df.startOfMonth(df.addMonths(date, 1)) };
				case 'year':
					return { start: df.startOfYear(date), end: df.startOfYear(df.addYears(date, 1)) };
			}
		},

		move: function(dir) {
			
			switch ( this.view ) {
				case VIEW.HOUR:
					this.current = df.addHours(this.current, dir);
					break;
				case VIEW.DAY:
					this.current = df.addDays(this.current, dir);
					break;
				case VIEW.WEEK:
					this.current = df.addWeeks(this.current, dir);
					break;
				case VIEW.MONTH:
					this.current = df.addMonths(this.current, dir);
					break;
				case VIEW.YEAR:
					this.current = df.addYears(this.current, dir);
					break;
				case VIEW.DECADE:
					this.current = df.addYears(this.current, 16 * dir);
					break;
			}
		},

		pointerEvent: function(ev) {

			ev.dataAttr = findDataAttr(ev.eventTarget, this.$el);
			
			if ( ev.eventType === 'over' ) {
				
				if ( isEq(this.prevOverDataAttr, ev.dataAttr) )
					return;
				this.prevOverDataAttr = ev.dataAttr;
			} else {
				
				this.prevOverDataAttr = undefined;
			}


			if ( 'nav' in ev.dataAttr ) {
				
				if ( ev.eventType === 'tap' )
					this.move(ev.dataAttr.nav);
				
				if ( ev.eventType === 'over' && ev.pointerActive ) {

					var startMove = function(timeout) {

						this.move(ev.dataAttr.nav);
						this.moveInterval = setTimeout(function() {
							
							startMove(Math.max(timeout * 0.8, 250));
						}, timeout);
					}.bind(this);
					startMove(750);
				}
			} else {
				
				if ( this.moveInterval !== undefined ) {
					
					clearInterval(this.moveInterval);
					this.moveInterval = undefined;
				}
			}


			if ( 'item' in ev.dataAttr ) {
				
				var value = JSON.parse(ev.dataAttr.item);
				var date = df.parse(value[0]*10000); // 10000: currently, min resolution is "minute"
				ev.type = value[1];
				
				if ( !ev.keyActive && ev.eventType === 'tap' ) {
					
					switch ( ev.type ) {
						case 'month':
							this.view = VIEW.MONTH;
							this.current = date;
							return;
						case 'year':
							this.view = VIEW.YEAR;
							this.current = date;
							return;
					}
				}
				
				if ( !ev.keyActive && ev.eventType === 'press' ) {
					
					switch ( ev.type ) {
						case 'hour':
							this.view = VIEW.HOUR;
							this.current = date;
							return;
						case 'day':
							this.view = VIEW.DAY;
							this.current = date;
							return;
						case 'week':
							this.view = VIEW.WEEK;
							this.current = date;
							return;
					}
				}
				
				ev.range = this.getItemRange(date, ev.type);
			}
			
			this.$emit('action', ev);
		},
	},
	created: function() {
		
		this.df = df;
		this.VIEW = VIEW;
	}
}


</script>