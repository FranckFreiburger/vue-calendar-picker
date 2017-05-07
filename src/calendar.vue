<template>
	<div class="calendar" :class="{ compact: compact }" @click="mouse" @dblclick="mouse" @mousedown="mouse" @mouseup="mouse" @mouseover="mouse">
		<div class="nav">
			<span class="prev" @click="move(-1)"></span>
			<span v-if="view <= VIEW.DAY" @click="view = VIEW.MONTH" v-text="df.getDate(current)"></span>
			<span v-if="view === VIEW.WEEK" @click="view = VIEW.MONTH" v-text="'W'+df.getISOWeek(current)"></span>
			<span v-if="view <= VIEW.MONTH" @click="view = VIEW.YEAR" v-text="format(current, 'MMM')"></span>
			<span v-if="view <= VIEW.YEAR" @click="view = VIEW.DECADE" v-text="df.getYear(current)"></span>
			<span class="next" @click="move(1)"></span>
		</div>
		<transition-group :name="animation" @after-enter="animation = ''" class="animation">
		
			<div v-if="view === VIEW.DAY" class="view dayView timeVertical" :key="posId">
				<div v-for="y in 12">
					<template v-for="x in 2">
						<span
							v-for="range in [getItemRange(df.setHours(current, (y-1) + (x-1)*12 ), 'hour')]"
							v-data:item.json="[+range.start, 'hour']"
							:class="[ 'selection'+selectionWhole(range) ]"
						>
							<span class="cellHead" v-html="df.format(range.start, 'HH[<sup>]:mm[</sup>]')"></span>
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
							v-data:item.json="[+arg, 'day']"
							:class="[ { this: df.isSameDay(today, arg) } ]"
							v-text="format(arg, 'ddD')"
						></span>
					</template>
				</div>
				<div v-for="y in 24">
					<span v-text="y-1"></span>
					<template v-for="x in 7">
						<span
							v-for="range in [getItemRange(df.addHours(df.addDays(df.startOfWeek(current, { weekStartsOn: firstDayOfTheWeek }), x-1), y-1), 'hour')]"
							v-data:item.json="[+range.start, 'hour']"
							:class="[ { thisMonth: df.isSameMonth(current, range.start) }, 'selection'+selectionWhole(range) ]"
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
				<div v-for="y in compact ? visibleWeeks : 6">
					<template v-for="week in [df.addDays(firstDayOfMonthView, (y-1) * 7)]">
						<span
							v-if="!compact"
							v-data:item.json="[week, 'week']"
							v-text="df.getISOWeek(week)"
						></span>
					</template>
					<template v-for="x in 7">
						<span
							v-for="range in [getItemRange(df.addDays(firstDayOfMonthView, (y-1) * 7 + (x-1)), 'day')]"
							v-data:item.json="[+range.start, 'day']"
							:class="[ { this: df.isSameDay(today, range.start), notThisMonth: !df.isSameMonth(current, range.start) }, 'selection'+selectionWhole(range) ]"
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
							v-data:item.json="[+range.start, 'month']"
							:class="[ { this: df.isSameMonth(today, range.start) }, 'selection'+selectionWhole(range) ]"
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
							v-data:item.json="[+range.start, 'year']"
							:class="[ { this: df.isSameMonth(today, range.start) }, 'selection'+selectionWhole(range) ]"
						>
							<span class="cellHead" v-text="df.getYear(range.start)"></span>
						</span>
					</template>
				</div>
			</div>
		</transition-group>
	</div>
</template>

<style scoped>

.forwardSlide-enter-active {
	position: absolute;
	animation: slide-out .5s ease;
}

.forwardSlide-leave-active {
	position: absolute;
	animation: slide-in .5s ease;
}

.reverseSlide-enter-active {
	position: absolute;
	animation: slide-in .5s ease-in reverse;
}

.reverseSlide-leave-active {
	position: absolute;
	animation: slide-out .5s ease-in reverse;
}

@keyframes slide-in {
	from {
		transform: translateX(0%);
		opacity: 1;
	}
	to {
		transform: translateX(-100%);
		opacity: 0;
	}
}

@keyframes slide-out {
	from {
		transform: translateX(100%);
		opacity: 0;
	}
	to {
		transform: translateX(0%);
		opacity: 1;
	}
}


.forwardScale-enter-active {
	position: relative;
	animation: scale-out .5s ease;
	transform-origin: 50% 50%;
}

.forwardScale-leave-active {
	position: absolute;
	animation: scale-in .5s ease;
	transform-origin: 50% 50%;
}

.reverseScale-enter-active {
	position: relative;
	animation: scale-in .5s ease-in reverse;
	transform-origin: 50% 50%;
}

.reverseScale-leave-active {
	position: absolute;
	animation: scale-out .5s ease-in reverse;
	transform-origin: 50% 50%;
}


@keyframes scale-in {
	from {
		transform: scale(1);
		opacity: 1;
	}
	to {
		transform: scale(0.5);
		opacity: 0;
	}
}

@keyframes scale-out {
	from {
		transform: scale(1.5);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}

.animation {
	display: block;
	position: relative;
	height: 100%;
	overflow: hidden;
}

.calendar {
	position: relative;

	width: 17em;
	height: 15em;

	display: inline-block;
	border: 2px solid #000;
	border-radius: 0.25em;
	cursor: default;
	user-select: none;
	padding-top: 2.5em;
}

.calendar.compact {
	padding-top: 1em;
}

</style>


<style>
/* nav */

.nav {
	position: absolute;
	top: 0;
	width: 100%;
	height: 2.5em;
	text-align: center;
}

.nav > span {
	box-sizing: border-box;
	display: inline-block;
	height: 100%;
	padding: 0.5em;
	cursor: pointer;
}

.nav .prev,
.nav .next {
	font-size: 150%;
	font-weight: bold;
	margin-top: -0.3em;
}

.nav .prev {
	float: left;
}

.nav .next {
	float: right;
}

.nav .prev:before {
	content: '\2190';
}

.nav .next:before {
	content: '\2192';
}

.compact .nav {
	height: 1em;
	margin-top: 0;
}

.compact .nav > span {
	padding: 0;
}

.compact .nav .prev {
	left: 0.25em;
	text-align: left;
}

.compact .nav .next {
	right: 0.25em;
	text-align: right;
}


/* selection */

span[data-item]:hover {
	background-color: #eee;
}

.this {
	outline: 2px dotted #faa;
}

.selection2 {
	background-color: #cde;
}

.selection1 {
	background-color: #def;
}


/* view */
.view {
	display: table;
	width: 100%;
	height: 100%;
}

.view > div {
	display: table-row;
}

.view > div > span {
	display: table-cell;
}


/* day */

.dayView > div > span {
	width: 50%;
	height: 1%;
}

.dayView .cellHead {
	margin-right: 0.5em;
	vertical-align: top;
}


/* week */

.weekView > div > span {
	line-height: 0;
}

.weekView > div:nth-child(4n+1) > span {
	border-bottom: 1px dashed silver;
}

.weekView > div:first-child > span {
	line-height: normal;
}

.weekView > div:nth-child(odd) > span:first-child {
	font-size: 0;
}


/* month */

.monthView > div > span {
	height: 15%;
}

.monthView > div:first-child > span {
	height: 1%;
	padding: 0 0.25em 0.25em 0.25em;
}

.calendar:not(.compact) .monthView > div > span:first-child {
	text-align: center;
	font-weight: bold;
}

.monthView .cellHead {
	text-align: center;
	display: block;
}

.monthView .notThisMonth .cellHead {
	color: silver;
}


/* yearView / decadeView */

.yearView > div > span,
.decadeView > div > span {
	text-align: center;
	vertical-align: middle;
}

.yearView .cellHead,
.decadeView .cellHead {
	padding: 0.25em;
}

</style>
<script>
"use strict";

var df = require('date-fns'); // https://date-fns.org

function firstDayOfTheWeek(locale) {
	
	if (' GB AG AR AS AU BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IE IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP NZ PA PE PH PK PR PY SA SG SV TH TN TT TW UM US VE VI WS YE ZA ZW '.indexOf(' '+locale+' ') !== -1 )
		return 0; // sun
	if (' AE AF BH DJ DZ EG IQ IR JO KW LY MA OM QA SD SY '.indexOf(' '+locale+' ') !== -1 )
		return 6; // sat
	if (' BD MV '.indexOf(' '+locale+' ') !== -1 )
		return 5; // fri
	return 1; // mon
}

var locales = {
	FR: require('date-fns/locale/fr'),
	RU: require('date-fns/locale/ru'),
}

function findDataAttr(elt, dataAttrName) {
	
	for ( ; elt !== null; elt = elt.parentNode )
		if ( elt.nodeType === 1 && dataAttrName in elt.dataset )
			return JSON.parse(elt.dataset[dataAttrName]);
	return undefined;
}

function isSame(val1, val2) {
	
	if ( val1 === val2 )
		return true;
	
	var type1 = typeof(val1);
	if ( type1 !== typeof(val2) )
		return false;
/*		
	if ( Array.isArray(val1) && Array.isArray(val1) ) {
		
		var len1 = val1.length;
		if ( len1 !== val2.length )
			return false;
		for ( var i = 0; i < len1; ++i )
			if ( !isSame(val1[i], val2[i]) )
				return false;
		return true;
	}
*/	
	if ( type1 === 'object' && val1 !== null && val2 !== null ) {
		
		var k1 = Object.keys(val1);
		var k1len = k1.length;
		if ( Object.keys(val2).length !== k1len )
			return false;

		for ( var i = 0; i < k1len; ++i )
			if ( !isSame(val1[k1[i]], val2[k1[i]]) )
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


module.exports = {
	
	directives: {
		data: function(el, binding) {

			if ( isSame(binding.value, binding.oldValue) )
				return;
			el.dataset[binding.arg] = binding.modifiers.json === true ? JSON.stringify(binding.value) : String(binding.value);
		}
	},

	props: {
		compact: {
			type: Boolean,
			default: false
		},
		selection: {
			type: Object,
			default: function() {
				return {}
			}
		}
	},
	
	data: function() {
		return {
			animation: '',
			locale: 'FR',
			view: VIEW.DAY,
			current: df.startOfDay(Date.now()),
			today: df.startOfDay(Date.now()),
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
			
			return firstDayOfTheWeek(this.locale);
		},
		
		visibleWeeks: function() {

			return Math.ceil((df.getDaysInMonth(this.current) + df.getDay(df.startOfMonth(this.current)) ) / 7);
		},

		firstDayOfMonthView: function() {
			
			return df.setDay(df.startOfMonth(this.current), this.firstDayOfTheWeek);
		}
	},
	
	methods: {
		format: function(date, format) {
			
			return df.format(date, format, { locale: locales[this.locale] })
		},
		
		getItemRange: function(date, type) {
			
			switch ( type ) {
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

		selectionWhole: function(dateRange) {
		
			var start = this.selection.start;
			var end = this.selection.end;
			var start = df.min(start, end);
			var end = df.max(start, end);

			if ( !(df.isAfter(start, dateRange.start) || df.isBefore(end, dateRange.end)) )
				return 2;
			if ( df.areRangesOverlapping(start, end, dateRange.start, dateRange.end) )
				return 1;
			return 0;
		},

		mouse: function(ev) {
			
			var value = findDataAttr(ev.target, 'item');
			if ( value === undefined )
				return;
			
			var date = df.parse(value[0]);
			var type = value[1];

			if ( ev.type === 'click' ) {
				
				switch ( type ) {
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
			
			if ( ev.type === 'dblclick' ) {
				
				switch ( type ) {
					case 'day':
						this.view = VIEW.DAY;
						this.current = date;
						break;
					case 'week':
						this.view = VIEW.WEEK;
						this.current = date;
						break;
				}
				return;
			}
			
			var range = this.getItemRange(date, type);
			this.$emit('action', ev.type, ev.buttons !== 0, range, type);
		},

		move: function(dir) {
			
			switch ( this.view ) {
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
					this.current = df.addYears(this.current, 12 * dir);
					break;
			}
		}
	},
	created: function() {
		
		this.df = df;
		this.VIEW = VIEW;
	}
}


</script>