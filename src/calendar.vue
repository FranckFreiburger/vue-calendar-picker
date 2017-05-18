<template>
	<div class="calendar" :class="{ compact: compact, multiView: viewCount > 1 }" v-onpointer="pointerEvent">
		<div class="nav">
			<span class="prev" data-nav="-1"></span>

			<span v-if="view <= PERIOD.YEAR" @click="view = PERIOD.DECADE" v-text="df.getYear(current)"></span>
			<span v-if="view <= PERIOD.MONTH" @click="view = PERIOD.YEAR" v-text="format(current, 'MMM')"></span>
			<span v-if="view === PERIOD.WEEK" @click="view = PERIOD.MONTH" v-text="'W'+df.getISOWeek(current)"></span>
			<span v-if="view <= PERIOD.DAY" @click="view = PERIOD.MONTH" v-text="df.getDate(current)"></span>
			<span v-if="view <= PERIOD.HOUR" @click="view = PERIOD.DAY">{{df.format(current, 'HH')}}<sup>h</sup></span>

			<span class="next" data-nav="1"></span>
		</div>
		<transition-group :name="animation" @after-enter="animation = ''" class="animation">

			<template v-for="current in views(current, view, viewCount)">

			<div
				v-if="view === PERIOD.HOUR"
				class="view hourView timeVertical"
				:key="viewId(current)"
				:style="{ width: (100/viewCount)+'%' }"
			>
				<div v-for="y in 15">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df.setMinutes(current, (y-1) + (x-1)*15 ), PERIOD.MINUTE)]"
							v-data:item.json="[+range.start/10000, PERIOD.MINUTE]"
							:class="[ { this: df.isSameMinute(today, range.start) }, itemClass(range, PERIOD.MINUTE) ]"
						>
							<div class="cellHead">{{df.format(range.start, 'mm')}}</div>
							<slot :item-range="range" layout="vertical"></slot>
						</span>
					</template>
				</div>
			</div>

			<div
				v-if="view === PERIOD.DAY"
				class="view dayView timeVertical"
				:key="viewId(current)"
				:style="{ width: (100/viewCount)+'%' }"
			>
				<div v-for="y in 12">
					<template v-for="x in 2">
						<span
							v-for="range in [getItemRange(df.setHours(current, (y-1) + (x-1)*12 ), PERIOD.HOUR)]"
							v-data:item.json="[+range.start/10000, PERIOD.HOUR]"
							:class="[ { this: df.isSameHour(today, range.start) }, itemClass(range, PERIOD.HOUR) ]"
						>
							<div class="cellHead">{{df.format(range.start, 'HH')}}<sup>h</sup></div>
							<slot :item-range="range" layout="vertical"></slot>
						</span>
					</template>
				</div>
			</div>

			<div
				v-if="view === PERIOD.WEEK"
				class="view weekView timeVertical"
				:key="viewId(current)"
				:style="{ width: (100/viewCount)+'%' }"
			>
				<div>
					<span></span>
					<template v-for="x in 7">
						<span
							v-for="arg in [df.addDays(df.startOfWeek(current, dfOptions), x-1)]"
							v-data:item.json="[+arg/10000, PERIOD.DAY]"
							:class="[ { this: df.isSameDay(today, arg) } ]"
						>{{format(arg, 'dd')}}<sub>{{df.getDate(arg)}}</sub></span>
					</template>
				</div>
				<div v-for="y in 24">
					<span v-text="y-1"></span>
					<template v-for="x in 7">
						<span
							v-for="range in [getItemRange(df.addHours(df.addDays(df.startOfWeek(current, dfOptions), x-1), y-1), PERIOD.HOUR)]"
							v-data:item.json="[+range.start/10000, PERIOD.HOUR]"
							:class="[ { thisMonth: df.isSameMonth(current, range.start) }, itemClass(range, PERIOD.HOUR) ]"
						>
							<slot :item-range="range" layout="vertical"></slot>
						</span>
					</template>
				</div>
			</div>

			<div
				v-if="view === PERIOD.MONTH"
				class="view monthView timeHorizontal"
				:key="viewId(current)"
				:style="{ width: (100/viewCount)+'%' }"
			>
				<div>
					<span v-if="!compact"></span>
					<span v-for="n in 7" v-text="format(df.setDay(current, firstDayOfTheWeek+n-1), compact ? 'dd' : 'ddd')"></span>
				</div>
				<div v-for="y in compact ? visibleWeeksCount(current) : 6">
					<template v-for="week in [df.addDays(firstDayOfMonth(current), (y-1) * 7)]">
						<span
							v-if="!compact && (y <= visibleWeeksCount(current) || viewCount === 1)"
							v-data:item.json="[+week/10000, PERIOD.WEEK]"
							v-text="df.getISOWeek(week)"
						></span>
					</template>
					<template v-for="x in 7">
						<span v-if="showOverlappingDays || df.isSameMonth(current, range.start)"
							v-for="range in [getItemRange(df.addDays(firstDayOfMonth(current), (y-1) * 7 + (x-1)), PERIOD.DAY)]"
							v-data:item.json="[+range.start/10000, PERIOD.DAY]"
							:class="[ { this: df.isSameDay(today, range.start), notThisMonth: !df.isSameMonth(current, range.start) }, itemClass(range, PERIOD.DAY) ]"
						>
							<div class="cellHead" v-text="df.getDate(range.start)"></div>
							<slot :item-range="range" layout="horizontal"></slot>
						</span>
						<span v-else></span>
					</template>
				</div>
			</div>
			
			<div
				v-if="view === PERIOD.YEAR"
				class="view yearView timeHorizontal"
				:key="viewId(current)"
				:style="{ width: (100/viewCount)+'%' }"
			>
				<div v-for="y in 3">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df.setMonth(current, (y-1)*4 + (x-1)), PERIOD.MONTH)]"
							v-data:item.json="[+range.start/10000, PERIOD.MONTH]"
							:class="[ { this: df.isSameMonth(today, range.start) }, itemClass(range, PERIOD.MONTH) ]"
						>
							<div class="cellHead" v-text="format(range.start, compact ? 'MMM' : 'MMMM')"></div>
							<slot :item-range="range" layout="horizontal"></slot>
						</span>
					</template>
				</div>
			</div>

			<div
				v-if="view === PERIOD.DECADE"
				class="view decadeView timeHorizontal"
				:key="viewId(current)"
				:style="{ width: (100/viewCount)+'%' }"
			>
				<div v-for="y in 4">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df.addYears(current, (y-1)*4 + (x-1) - 9), PERIOD.YEAR)]"
							v-data:item.json="[+range.start/10000, PERIOD.YEAR]"
							:class="[ { this: df.isSameYear(today, range.start) }, itemClass(range, PERIOD.YEAR) ]"
						>
							<div class="cellHead" v-text="df.getYear(range.start)"></div>
						</span>
					</template>
				</div>
			</div>
			
			</template>
		</transition-group>
	</div>
</template>

<style>


.view {
	transition-duration: .5s;
	transition-timing-function: ease-out;
	transition-property: transform, opacity;
}

.calendar .forwardSlide-leave-to,
.calendar .reverseSlide-enter {
	transform: translateX(-100%);
	opacity: 0;
}

.calendar .forwardSlide-enter,
.calendar .reverseSlide-leave-to {
	transform: translateX(100%);
	opacity: 0;
}

.calendar.multiView .reverseSlide-leave-to {
	transform: translateX(0);
}

.calendar .reverseSlide-leave-active {
	position: absolute;
}



.calendar .forwardScale-leave-to,
.calendar .reverseScale-enter {
	transform: scale(.5);
	opacity: 0;
}

.calendar .forwardScale-enter,
.calendar .reverseScale-leave-to {
	transform: scale(1.5);
	opacity: 0;
}

.calendar .forwardScale-leave-active,
.calendar .reverseScale-leave-active {
	position: absolute;
}

.calendar .forwardScale-leave-active {
	transform-origin: inherit;
}


.calendar .animation {
	display: inline-block;
	position: relative;
	height: 100%;
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
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
	outline: 1px dotted #000;
}

.calendar .this {
	outline: 1px dotted #f55;
}


/* view */

.calendar .view {
	display: inline-table;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	line-height: 1;
	padding: 1px;
}

/*
.calendar.multiView .view {
	border-left: 1px solid silver;
}

.calendar.multiView .view.forwardScale-leave-to,
.calendar.multiView .view.forwardSlide-leave-to {
	border-right: 1px solid silver;
}

.calendar.multiView .view:first-child,
.calendar.multiView .view.forwardSlide-leave-to + .view {
	border-left: none;
}


.calendar.multiView:not(.compact) .view {
	padding-left: 0.5em;
}

.calendar.multiView:not(.compact) .view:first-child,
.calendar.multiView:not(.compact) .forwardSlide-leave-to + .view {
	padding-left: 0;
}
*/

.calendar .view > div {
	display: table-row;
}

.calendar .view > div > span {
	display: table-cell;
	vertical-align: top;
	height: 0%;
	line-height: 0.5;
}

.calendar .cellHead {
	vertical-align: top;
	line-height: 1;
}


/* hour */

.calendar .hourView .cellHead {
	display: inline-block;
	width: 1em;
	font-size: 75%;
}

.calendar .hourView > div > span {
	height: 6%;
}

/* day */

.calendar .dayView .cellHead {
	margin-right: 0.5em;
	display: inline-block;
	width: 1.25em;
}

.calendar .dayView > div > span {
	height: 8%;
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
	padding: 0.25em;
	text-align: center;
}

.calendar:not(.compact) .monthView > div > span:first-child {
	text-align: center;
	font-weight: bold;
	padding-right: 0.25em;
	line-height: 1;
}

.calendar .monthView .cellHead {
	text-align: center;
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

var PERIOD = {
	MINUTE: 2,
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


module.exports = {
	
	directives: {
		data: function(el, binding) {

			if ( isEq(binding.value, binding.oldValue) )
				return;
			// IE[9, 10] does not reflect dataset into dom attributes.
			//el.dataset[binding.arg] = binding.modifiers.json === true ? JSON.stringify(binding.value) : String(binding.value);
			el.setAttribute('data-'+binding.arg, binding.modifiers.json === true ? JSON.stringify(binding.value) : String(binding.value));
			
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
			default: PERIOD.MONTH,
		},
		initialCurrent: {
			type: [Date, String, Number],
			default: function() {
				return new Date
			}
		},
		viewCount: {
			type: Number,
			default: 1,
		},
		showOverlappingDays: {
			type: Boolean,
			default: function() {

				return this.viewCount === 1;
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
		
		firstDayOfTheWeek: function() {
					
			if (' GB AG AR AS AU BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IE IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP NZ PA PE PH PK PR PY SA SG SV TH TN TT TW UM US VE VI WS YE ZA ZW '.indexOf(' '+this.locale+' ') !== -1 )
				return 0; // sun
			if (' AE AF BH DJ DZ EG IQ IR JO KW LY MA OM QA SD SY '.indexOf(' '+this.locale+' ') !== -1 )
				return 6; // sat
			if (' BD MV '.indexOf(' '+this.locale+' ') !== -1 )
				return 5; // fri
			return 1; // mon
		},
		
		dateFnsLocale: function() {
			
			return require('date-fns/locale/'+this.locale.toLowerCase()+'/index.js');
		},
		
		dfOptions: function() {
			return { weekStartsOn: this.firstDayOfTheWeek };
		}
	},
	
	methods: {
		
		views: function(current, type, count) {
			
			var views = new Array(count);
			for ( var i = 0; i < count; ++i )
				views[i] = this.dateAdd(current, type, i);
			return views;
		},
		
		viewId: function(current) {
			
			return String(this.view) + String(df.getTime(current));
		},

		format: function(date, format) {

			return df.format(date, format, { locale: this.dateFnsLocale });
		},

		firstDayOfMonth: function(date) {
			
			return df.setDay(df.startOfMonth(date), this.firstDayOfTheWeek);
		},
		
		visibleWeeksCount: function(current) {

			return Math.ceil((df.getDaysInMonth(current) + df.getDay(df.startOfMonth(current))) / 7);
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
					this.current = this.dateAdd(this.current, this.view, ev.dataAttr.nav);
				
				if ( ev.eventType === 'over' && ev.pointerActive ) {

					var startMove = function(timeout) {

						this.current = this.dateAdd(this.current, this.view, ev.dataAttr.nav);
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
				ev.type = value[1];
				ev.range = this.getItemRange(df.parse(value[0]*10000), ev.type); // 10000: currently, min resolution is "minute"
				
				if ( !ev.keyActive && ((ev.eventType === 'tap' && ev.type >= PERIOD.MONTH) || (ev.eventType === 'press' && ev.type < PERIOD.MONTH && ev.type > PERIOD.MINUTE )) ) {
						
					this.view = ev.type;
					this.current = ev.range.start;
					return;
				}
			}
			
			this.$emit('action', ev);
		},
	},
	created: function() {
		
		this.df = df;
		this.PERIOD = PERIOD;
	}
}


</script>