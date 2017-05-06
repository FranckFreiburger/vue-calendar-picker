<template>
	<div class="calendar" :class="{ compact: compact }" @click="mouse" @dblclick="mouse" @mousedown="mouse" @mouseup="mouse" @mouseover="mouse">
		<div class="nav">
			<span class="prev" @click="move(-1)"></span>
			<span v-if="view <= VIEW.DAY" @click="view = VIEW.MONTH" v-text="df.getDate(current)"></span>
			<span v-if="view === VIEW.WEEK" @click="view = VIEW.MONTH" v-text="'['+df.getISOWeek(current)+']'"></span>
			<span v-if="view <= VIEW.MONTH" @click="view = VIEW.YEAR" v-text="format(current, 'MMM')"></span>
			<span v-if="view <= VIEW.YEAR" @click="view = VIEW.DECADE" v-text="df.getYear(current)"></span>
			<span class="next" @click="move(1)"></span>
		</div>
		<transition-group :name="animation" @after-enter="animation = ''" class="animation">
		
			<div v-if="view === VIEW.DAY" class="view dayView timeVertical" :key="posId">
				<div v-for="y in 12">
					<template v-for="x in 2">
						<span v-for="arg in [df.setHours(current, (y-1) + (x-1)*12 )]" v-data:item.json="[+arg, 'hour']" :class="[ 'selection'+selectionWhole(arg, 'hour') ]">
							<span v-text="df.format(arg, 'HH:mm')"></span>
							<div class="events">
								<div v-for="event in ranges" v-if="!df.isEqual(event.start, event.end) && isWithinRangeExcludeEnd(arg, event.start, event.end)" class="eventRange" :style="{ backgroundColor: event.color }"></div>
								<div v-for="event in ranges" v-if="df.isEqual(event.start, event.end) && df.isSameHour(arg, event.start)" class="eventAt" :style="{ backgroundColor: event.color }"></div>
							</div>
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
							v-for="arg in [df.addHours(df.addDays(df.startOfWeek(current, { weekStartsOn: firstDayOfTheWeek }), x-1), y-1)]"
							v-data:item.json="[+arg, 'hour']"
							:class="[ { thisMonth: df.isSameMonth(current, arg) }, 'selection'+selectionWhole(arg, 'hour') ]"
						>
							<div class="events">
								<div v-for="event in ranges" v-if="!df.isEqual(event.start, event.end) && isWithinRangeExcludeEnd(arg, event.start, event.end)" class="eventRange" :style="{ backgroundColor: event.color }"></div>
								<div v-for="event in ranges" v-if="df.isEqual(event.start, event.end) && df.isSameHour(arg, event.start)" class="eventAt" :style="{ backgroundColor: event.color }"></div>
							</div>
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
						<span v-if="!compact" v-data:item.json="[week, 'week']" v-text="df.getISOWeek(week)"></span>
					</template>
					<template v-for="x in 7">
						<span
							v-for="arg in [df.addDays(firstDayOfMonthView, (y-1) * 7 + (x-1))]"
							v-data:item.json="[+arg, 'day']"
							:class="[ { this: df.isSameDay(today, arg), notThisMonth: !df.isSameMonth(current, arg) }, 'selection'+selectionWhole(arg, 'day') ]"
						>
							<span class="dayNumber" v-text="df.getDate(arg)"></span>
							<div class="events">
								<div v-for="event in ranges" v-if="!df.isEqual(event.start, event.end) && isWithinRangeExcludeEnd(arg, event.start, event.end)" class="eventRange" :style="{ backgroundColor: event.color }"></div>
								<div v-for="event in ranges" v-if="df.isEqual(event.start, event.end) && df.isSameDay(arg, event.start)" class="eventAt" :style="{ backgroundColor: event.color }"></div>
							</div>
						</span>
					</template>
				</div>
			</div>
			
			<div v-if="view === VIEW.YEAR" class="view yearView timeHorizontal" :key="posId">
				<div v-for="y in 3">
					<template v-for="x in 4">
						<span
							v-for="arg in [df.setMonth(current, (y-1)*4 + (x-1))]"
							v-data:item.json="[+arg, 'month']"
							:class="{ this: df.isSameMonth(today, arg) }"
							v-text="format(arg, compact ? 'MMM' : 'MMMM')"
						></span>
					</template>
				</div>
			</div>

			<div v-if="view === VIEW.DECADE" class="view decadeView timeHorizontal" :key="posId">
				<div v-for="y in 4">
					<template v-for="x in 4">
						<span
							v-for="arg in [df.addYears(current, (y-1)*4 + (x-1) - 9)]"
							v-data:item.json="[+arg, 'year']"
							:class="{ this: df.isSameYear(today, arg) }"
							v-text="df.getYear(arg)"
						></span>
					</template>
				</div>
			</div>
		</transition-group>
	</div>
</template>

<style>

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

/* */

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



/* events */

.view .events {
	display: inline-block;
	line-height: 0;
}

.view .eventRange {
	display: inline-block;
}

.view .eventAt {
	display: inline-block;
	margin: 1px;
	width: 4px;
	height: 4px;
}

.timeHorizontal .events {
	width: 100%;
	vertical-align: top;
}

.timeHorizontal .eventRange {
	width: 100%;
	margin: 2px 0;
	height: 2px;
}

.timeHorizontal .eventAt {
}

.timeVertical .events {
	height: 100%;
}

.timeVertical .eventRange {
	height: 100%;
	margin: 0 2px;
	width: 2px;	
}

.timeVertical .eventAt {
	vertical-align: middle;
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

.dayView > div > span span:first-child {
	margin-right: 0.5em;
	vertical-align: top;
}


/* week */

.weekView > div > span {
	line-height: 0;
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
	text-align: center;
}

.monthView > div:first-child > span {
	height: 1%;
	padding: 0 0.25em 0.25em 0.25em;
}

.monthView > div > span:first-child {
	text-align: center;
	font-weight: bold;
}

.monthView .notThisMonth .dayNumber {
	color: silver;
}


/* yearView / decadeView */

.yearView > div > span,
.decadeView > div > span {
	text-align: center;
	vertical-align: middle;
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

			if ( binding.value === binding.oldValue )
				return;
			el.dataset[binding.arg] = binding.modifiers.json === true ? JSON.stringify(binding.value) : binding.value;
		}
	},

	props: {
		compact: {
			type: Boolean,
			default: false
		},
		ranges: {
			type: Array,
			default: []
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

		selectionWhole: function(date, type) {
		
			var start = this.selection.start;
			var end = this.selection.end;
			var min = df.min(start, end);
			var max = df.max(start, end);

			var dateRange = this.getItemRange(date, type)

			if ( !(df.isAfter(min, dateRange.start) || df.isBefore(max, dateRange.end)) )
				return 2;
			if ( df.areRangesOverlapping(min, max, dateRange.start, dateRange.end) )
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
			
			console.log(date, type,  range )
			this.$emit(ev.type, range, this.view, ev.buttons !== 0);
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
		
		this.isWithinRangeExcludeEnd = function(dirtyDate, dirtyStartDate, dirtyEndDate) {
			
			return df.isWithinRange(dirtyDate, dirtyStartDate, dirtyEndDate) && !df.isEqual(dirtyDate, dirtyEndDate);
		}
				
		this.df = df;
		this.VIEW = VIEW;
	}
}


</script>