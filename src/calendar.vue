<template>
	<div class="calendar" :class="{ compact: compact }">
		<div class="nav">
			<span class="prev" @click="move(-1)"></span>
			<span v-if="view < 4" @click="view = 4" v-text="df.getDate(current)"></span>
			<span v-if="view < 5" @click="view = 5" v-text="monthShortNames[df.getMonth(current)]"></span>
			<span v-if="view < 6" @click="view = 6" v-text="df.getYear(current)"></span>
			<span class="next" @click="move(1)"></span>
		</div>
		<transition-group :name="animation" @after-enter="animation = ''" class="animation">
			<div v-if="view === 3" class="dayView" :key="upos">
				<div v-for="y in 12" class="hourRow">
					<div v-for="x in 2" class="hourCell">
						<template v-for="arg in [df.setHours(current, (y-1) + (x-1)*12 )]">
							<div class="hourHead" v-text="df.format(arg, 'HH:mm')"></div>
							<div class="events">
								<div v-for="event in ranges" v-if="!df.isEqual(event.start, event.end) && df.isWithinRange(arg, event.start, df.subMilliseconds(event.end, 1))" class="eventRange" :style="{ backgroundColor: event.color }"></div>
								<div v-for="event in ranges" v-if="df.isEqual(event.start, event.end) && df.isSameHour(arg, event.start)" class="eventAt" :style="{ backgroundColor: event.color }"></div>
							</div>							
						</template>
					</div>
				</div>
			</div>
			<div v-if="view === 4" class="monthView" :key="upos">
				<div class="dayNameRow">
					<div v-if="!compact" class="dayNameCell"></div>
					<div v-for="n in 7" class="dayNameCell" v-text="dowShortNames[(n-1 +firstDayOfTheWeek)%7]"></div>
				</div>
				<div v-for="w in compact ? visibleWeeks : 6" class="week">
					<div v-if="!compact" class="weekHead" v-text="df.getISOWeek(date(w-1, 0))"></div>
					<template v-for="d in 7">
					<template v-for="arg in [date(w-1, d-1)]">
						<div class="dayCell" :class="{ this: df.isSameDay(today, arg), thisMonth: df.isSameMonth(current, arg), selection: dateInSelectionRange(arg) }" @click="$emit('click', arg)" @dblclick="dblclick(arg)" @mouseenter="$emit('over', arg, $event.buttons !== 0)" @mousedown="$emit('mousedown', arg)" @mouseup="$emit('mouseup', arg)">
							<div class="dayNumber" v-text="df.getDate(arg)"></div>
							<div class="events">
								<div v-for="event in ranges" v-if="!df.isEqual(event.start, event.end) && df.isWithinRange(arg, event.start, df.subMilliseconds(event.end, 1))" class="eventRange" :style="{ backgroundColor: event.color }"></div>
								<div v-for="event in ranges" v-if="df.isEqual(event.start, event.end) && df.isSameDay(arg, event.start)" class="eventAt" :style="{ backgroundColor: event.color }"></div>
							</div>
						</div>
					</template>
					</template>
				</div>
			</div>
			<div v-if="view === 5" class="yearView" :key="upos">
				<div v-for="y in 3" class="monthRow">
					<template v-for="x in 4">
					<template v-for="arg in [df.setMonth(current, (y-1)*4 + (x-1))]">
						<div class="monthCell" :class="{ this: df.isSameMonth(today, arg) }" @click="current = arg; view = 4" v-text="monthShortNames[df.getMonth(arg)]"></div>
					</template>
					</template>
				</div>
			</div>
			<div v-if="view === 6" class="centuryView" :key="upos">
				<div v-for="y in 4" class="yearRow">
					<template v-for="x in 4">
					<template v-for="arg in [df.addYears(current, (y-1)*4 + (x-1) - 9)]">
							<div class="yearCell" :class="{ this: df.isSameYear(today, arg) }" @click="current = arg; view = 5" v-text="df.getYear(arg)"></div>
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
	overflow: hidden;
	height: 100%;
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
	cursor: pointer;
	padding: 0.5em;
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

.compact .nav > span {
	padding: 0;
}

.compact .nav {
	height: 1em;
	margin-top: 0;
}

.compact .nav .prev {
	left: 0.25em;
	text-align: left;
}

.compact .nav .next {
	right: 0.25em;
	text-align: right;
}
	
/* day */

.dayView {
	display: table;
	width: 100%;
	height: 100%;
}

.hourRow {
	display: table-row;
}

.hourCell {
	display: table-cell;
	width: 50%;
}

.hourHead {
	display: inline-block;
	margin-right: 0.5em;
}


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


/* month */
.monthView {
	display: table;
	width: 100%;
	height: 100%;
}

.dayNameRow {
	display: table-row;
}

.dayNameCell {
	display: table-cell;
	text-align: center;
}

.week {
	display: table-row;
	height: 15%;
}

.weekHead {
	display: table-cell;
	width: 1.5em;
	text-align: center;
	font-weight: bold;
}

.dayCell {
	display: table-cell;
	width: 13%;
}

.dayCell:hover,
.monthCell:hover,
.yearCell:hover {
	background-color: #eee;
}

.dayNumber {
	text-align: center;
}


.this {
	outline: 2px dotted #faa;
}

.dayCell:not(.thisMonth) .dayNumber {
	color: silver;
}

.selection {
	background-color: #def;
}


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

/* yearView / centuryView */

.yearView,
.centuryView {
	display: table;
	width: 100%;
	height: 100%;
}

.yearView .monthRow,
.centuryView .yearRow {
	display: table-row;
}

.yearView .monthCell,
.centuryView .yearCell {
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

module.exports = {

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
			view: 3,
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
		
		upos: function() {
			
			return String(this.view) + String(df.getTime(this.current));
		},
		
		firstDayOfTheWeek: function() {
			
			return firstDayOfTheWeek(this.locale);
		},

		visibleWeeks: function() {

			return Math.ceil((df.getDaysInMonth(this.current) + df.getDay(df.startOfMonth(this.current)) ) / 7);
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
		}
	},
	
	methods: {
		
		date: function(y, x) {

			return df.addDays(df.setDay(df.startOfMonth(this.current), this.firstDayOfTheWeek), y * 7 + x);
		},
		
		dateInSelectionRange: function(date) {
		
			var start = this.selection.start;
			var end = this.selection.end;
			return df.isWithinRange(date, df.min(start, end), df.max(start, end));
		},
		
		dblclick: function(arg) {
		
			this.current = arg;
			this.view = 3
		},

		move: function(dir) {
			
			switch ( this.view ) {
				case 3:
					this.current = df.addDays(this.current, dir);
					break;
				case 4:
					this.current = df.addMonths(this.current, dir);
					break;
				case 5:
					this.current = df.addYears(this.current, dir);
					break;
				case 6:
					this.current = df.addYears(this.current, 12 * dir);
					break;
			}
		}
	},
	created: function() {
		
		this.df = df;
	}
}


</script>