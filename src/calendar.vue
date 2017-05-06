<template>
	<div class="calendar" :class="{ compact: compact }">
		<div class="nav">
			<span class="prev" @click="move(-1)"></span>
			<span v-if="view <= VIEW.DAY" @click="view = VIEW.MONTH" v-text="df.getDate(current)"></span>
			<span v-if="view === VIEW.WEEK" @click="view = VIEW.MONTH" v-text="'['+df.getISOWeek(current)+']'"></span>
			<span v-if="view <= VIEW.MONTH" @click="view = VIEW.YEAR" v-text="monthShortNames[df.getMonth(current)]"></span>
			<span v-if="view <= VIEW.YEAR" @click="view = VIEW.DECADE" v-text="df.getYear(current)"></span>
			<span class="next" @click="move(1)"></span>
		</div>
		<transition-group :name="animation" @after-enter="animation = ''" class="animation">
			<div v-if="view === VIEW.DAY" class="dayView" :key="posId" @click="mouse" @dblclick="mouse" @mousedown="mouse" @mouseup="mouse" @mouseover="mouse">
				<div v-for="y in 12" class="hourRow">
					<template v-for="x in 2">
						<div v-for="arg in [df.setHours(current, (y-1) + (x-1)*12 )]" v-data:item.json="[+arg, 'hour']" class="hourCell" :class="[ 'selection'+selectionWhole(arg, 'hour') ]">
							<div class="hourHead" v-text="df.format(arg, 'HH:mm')"></div>
							<div class="events">
								<div v-for="event in ranges" v-if="!df.isEqual(event.start, event.end) && isWithinRangeExcludeEnd(arg, event.start, event.end)" class="eventRange" :style="{ backgroundColor: event.color }"></div>
								<div v-for="event in ranges" v-if="df.isEqual(event.start, event.end) && df.isSameHour(arg, event.start)" class="eventAt" :style="{ backgroundColor: event.color }"></div>
							</div>
						</div>
					</template>
				</div>
			</div>

			<div v-if="view === VIEW.WEEK" class="weekView" :key="posId" @click="mouse" @dblclick="mouse" @mousedown="mouse" @mouseup="mouse" @mouseover="mouse">
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

			
			<div v-if="view === VIEW.MONTH" class="monthView" :key="posId" @click="mouse" @dblclick="mouse" @mousedown="mouse" @mouseup="mouse" @mouseover="mouse">
				<div class="dayNameRow">
					<div v-if="!compact" class="dayNameCell"></div>
					<div v-for="n in 7" class="dayNameCell" v-text="dowShortNames[(n-1 +firstDayOfTheWeek)%7]"></div>
				</div>
				<div v-for="y in compact ? visibleWeeks : 6" class="dayRow">
					<template v-for="week in [df.addDays(firstDayOfMonthView, (y-1) * 7)]">
						<div v-if="!compact" v-data:item.json="[week, 'week']" class="dayRowHead" v-text="df.getISOWeek(week)"></div>
					</template>
					<template v-for="x in 7">
					<template v-for="arg in [df.addDays(firstDayOfMonthView, (y-1) * 7 + (x-1))]">
						<div v-data:item.json="[+arg, 'day']" class="dayCell" :class="[ { this: df.isSameDay(today, arg), thisMonth: df.isSameMonth(current, arg) }, 'selection'+selectionWhole(arg, 'day') ]">
							<div class="dayNumber" v-text="df.getDate(arg)"></div>
							<div class="events">
								<div v-for="event in ranges" v-if="!df.isEqual(event.start, event.end) && isWithinRangeExcludeEnd(arg, event.start, event.end)" class="eventRange" :style="{ backgroundColor: event.color }"></div>
								<div v-for="event in ranges" v-if="df.isEqual(event.start, event.end) && df.isSameDay(arg, event.start)" class="eventAt" :style="{ backgroundColor: event.color }"></div>
							</div>
						</div>
					</template>
					</template>
				</div>
			</div>
			
			
			<div v-if="view === VIEW.YEAR" class="yearView" :key="posId">
				<div v-for="y in 3" class="monthRow">
					<template v-for="x in 4">
					<template v-for="arg in [df.setMonth(current, (y-1)*4 + (x-1))]">
						<div class="monthCell" :class="{ this: df.isSameMonth(today, arg) }" @click="current = arg; view = VIEW.MONTH" v-text="monthShortNames[df.getMonth(arg)]"></div>
					</template>
					</template>
				</div>
			</div>
			<div v-if="view === VIEW.DECADE" class="decadeView" :key="posId">
				<div v-for="y in 4" class="yearRow">
					<template v-for="x in 4">
					<template v-for="arg in [df.addYears(current, (y-1)*4 + (x-1) - 9)]">
						<div class="yearCell" :class="{ this: df.isSameYear(today, arg) }" @click="current = arg; view = VIEW.YEAR" v-text="df.getYear(arg)"></div>
					</template>
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

.row {
	display: table-row;
}

.cell {
	display: table-cell;
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

.hourCell:hover,
.dayCell:hover,
.monthCell:hover,
.yearCell:hover {
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



/* day */

.dayView {
	display: table;
	width: 100%;
	height: 100%;
}

.dayView .hourRow {
	display: table-row;
}

.dayView .hourCell {
	display: table-cell;
	width: 50%;
}

.dayView .hourHead {
	display: inline-block;
	margin-right: 0.5em;
}


/* events */

.dayView .events {
	display: inline-block;
	height: 100%;
}

.dayView .eventRange {
	display: inline-block;
	margin: 0 2px;
	width: 4px;
	height: 100%;
}

.dayView .eventAt {
	display: inline-block;
	vertical-align: middle;
	margin: 1px;
	width: 4px;
	height: 4px;
}


/* week */

.weekView {
	display: table;
	width: 100%;
	height: 100%;
}

.weekView > div {
	display: table-row;
}

.weekView > div > span {
	display: table-cell;
	line-height: 0;
}

.weekView > div:first-child > span {
	line-height: normal;
}

.weekView > div:nth-child(odd) > span:first-child {
	font-size: 0;
}


.weekView .events {
	display: inline-block;
	height: 100%;
}

.weekView .eventRange {
	display: inline-block;
	margin: 0 2px;
	width: 4px;
	height: 100%;
}

.weekView .eventAt {
	display: inline-block;
	vertical-align: middle;
	margin: 1px;
	width: 4px;
	height: 4px;
}






/* month */

.monthView {
	display: table;
	width: 100%;
	height: 100%;
}

.monthView .dayNameRow {
	display: table-row;
}

.monthView .dayNameCell {
	display: table-cell;
	text-align: center;
	white-space: nowrap;
}

.monthView .dayRow {
	display: table-row;
	height: 15%;
}

.monthView .dayRowHead {
	display: table-cell;
	width: 1.5em;
	text-align: center;
	font-weight: bold;
}

.monthView .dayCell {
	display: table-cell;
	width: 13%;
}

.monthView .dayNumber {
	text-align: center;
}

.monthView .dayCell:not(.thisMonth) .dayNumber {
	color: silver;
}


/* month */

.monthView .events {
	text-align: center;
	line-height: 0;
}

.monthView .eventRange {
	margin: 2px 0;
	height: 2px;
}

.monthView .eventAt {
	display: inline-block;
	margin: 1px;
	width: 4px;
	height: 4px;
}

/* yearView / decadeView */

.yearView,
.decadeView {
	display: table;
	width: 100%;
	height: 100%;
}

.yearView .monthRow,
.decadeView .yearRow {
	display: table-row;
}

.yearView .monthCell,
.decadeView .yearCell {
	display: table-cell;
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
			view: VIEW.MONTH,
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

		dowShortNames: function() {
		
			var d = df.startOfWeek(new Date());
			var names = [];
			for ( var i = 0; i < 7; ++i )
				names.push( df.format(df.addDays(d, i), this.compact ? 'dd' : 'ddd', { locale: locales[this.locale] }) );
			return names;
		},
		monthShortNames: function() {
		
			var d = df.startOfYear(new Date());
			var names = [];
			for ( var i = 0; i < 12; ++i )
				names.push( df.format(df.addMonths(d, i), this.compact ? 'MMM' : 'MMMM', { locale: locales[this.locale] }) );
			return names;
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
			
			
			if ( ev.type === 'dblclick' ) {
				
				switch ( type ) {
					case 'week':
						this.view = VIEW.WEEK;
						this.current = date;
						break;
					case 'day':
						this.view = VIEW.DAY;
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