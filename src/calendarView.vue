<template>
	<div class="view">
		<slot name="header" :view="view" :current="current"></slot>
		<div class="content" :class="[ PERIOD[view]+'View', viewLayout[view]+'Layout' ]">

			<template v-if="view === PERIOD.HOUR">
				<div v-for="y in 15">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df_setMinutes(current, (y-1) + (x-1)*15 ), PERIOD.MINUTE)]"
							v-data:item="[+range.start/10000, PERIOD.MINUTE]"
							:class="[ { today: df_isSameMinute(today, range.start) }, itemClass(range, PERIOD.MINUTE) ]"
						>
							<div class="cellHead">{{df_format(range.start, 'mm')}}</div>
							<slot :item-range="range" :layout="viewLayout[view]"></slot>
						</span>
					</template>
				</div>
			</template>

			<template v-if="view === PERIOD.DAY">
				<div v-for="y in 12">
					<template v-for="x in 2">
						<span
							v-for="range in [getItemRange(df_setHours(current, (y-1) + (x-1)*12 ), PERIOD.HOUR)]"
							v-data:item="[+range.start/10000, PERIOD.HOUR]"
							:class="[ { today: df_isSameHour(today, range.start) }, itemClass(range, PERIOD.HOUR) ]"
						>
							<div class="cellHead">{{df_format(range.start, 'HH')}}<sup>h</sup></div>
							<slot :item-range="range" :layout="viewLayout[view]"></slot>
						</span>
					</template>
				</div>
			</template>

			<template v-if="view === PERIOD.WEEK">
				<div>
					<span></span>
					<template v-for="x in 7">
						<span
							v-for="arg in [df_addDays(df_startOfWeek(current, dfOptions), x-1)]"
							v-data:item="[+arg/10000, PERIOD.DAY]"
							:class="[ { today: df_isSameDay(today, arg) } ]"
						>{{format(arg, 'dd')}}<sub>{{df_getDate(arg)}}</sub></span>
					</template>
				</div>
				<div v-for="y in 24">
					<span v-text="y-1"></span>
					<template v-for="x in 7">
						<span
							v-for="range in [getItemRange(df_addHours(df_addDays(df_startOfWeek(current, dfOptions), x-1), y-1), PERIOD.HOUR)]"
							v-data:item="[+range.start/10000, PERIOD.HOUR]"
							:class="[ { thisMonth: df_isSameMonth(current, range.start) }, itemClass(range, PERIOD.HOUR) ]"
						>
							<slot :item-range="range" :layout="viewLayout[view]"></slot>
						</span>
					</template>
				</div>
			</template>

			<template v-if="view === PERIOD.MONTH">
				<div>
					<span v-if="!compact"></span>
					<span v-for="n in 7" v-text="format(df_setDay(current, firstDayOfTheWeek+n-1), compact ? 'dd' : 'ddd')"></span>
				</div>
				<div v-for="y in compact ? visibleWeeksCount(current) : 6">
					<template v-for="week in [df_addDays(firstVisibleDayOfMonthView(current), (y-1) * 7)]">
						<span
							v-if="!compact && (y <= visibleWeeksCount(current) || showOverlappingDays)"
							v-data:item="[+week/10000, PERIOD.WEEK]"
							v-text="df_getISOWeek(week)"
						></span>
					</template>
					<template v-for="x in 7">
						<span 
							v-if="showOverlappingDays || df_isSameMonth(current, range.start)"
							v-for="range in [getItemRange(df_addDays(firstVisibleDayOfMonthView(current), (y-1) * 7 + (x-1)), PERIOD.DAY)]"
							v-data:item="[+range.start/10000, PERIOD.DAY]"
							:class="[ { today: df_isSameDay(today, range.start), notThisMonth: !df_isSameMonth(current, range.start) }, itemClass(range, PERIOD.DAY) ]"
						>
							<div class="cellHead" v-text="df_getDate(range.start)"></div>
							<slot :item-range="range" :layout="viewLayout[view]"></slot>
						</span>
						<span v-else></span>
					</template>
				</div>
			</template>
			
			<template v-if="view === PERIOD.YEAR">
				<div v-for="y in 3">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df_setMonth(current, (y-1)*4 + (x-1)), PERIOD.MONTH)]"
							v-data:item="[+range.start/10000, PERIOD.MONTH]"
							:class="[ { today: df_isSameMonth(today, range.start) }, itemClass(range, PERIOD.MONTH) ]"
						>
							<div class="cellHead" v-text="format(range.start, compact ? 'MMM' : 'MMMM')"></div>
							<slot :item-range="range" :layout="viewLayout[view]"></slot>
						</span>
					</template>
				</div>
			</template>

			<template v-if="view === PERIOD.DECADE">
				<div v-for="y in 4">
					<template v-for="x in 4">
						<span
							v-for="range in [getItemRange(df_addYears(current, (y-1)*4 + (x-1) - 9), PERIOD.YEAR)]"
							v-data:item="[+range.start/10000, PERIOD.YEAR]"
							:class="[ { today: df_isSameYear(today, range.start) }, itemClass(range, PERIOD.YEAR) ]"
						>
							<div class="cellHead" v-text="df_getYear(range.start)"></div>
						</span>
					</template>
				</div>
			</template>	
		</div>
	</div>
</template>

<style>

.calendar .view {
	display: inline-block;
	height: 100%;
}

/* highlighting */

.calendar span[data-item]:hover {
	outline: 1px dotted #000;
}

.calendar .today {
	outline: 1px dotted #f55;
}


/* view */

.calendar .content {
	display: inline-table;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	line-height: 1;
	padding: 1px;
}

.calendar .content > div {
	display: table-row;
}

.calendar .content > div > span {
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

import { setMinutes as df_setMinutes, isSameMinute as df_isSameMinute, format as df_format, setHours as df_setHours, isSameHour as df_isSameHour, addDays as df_addDays, startOfWeek as df_startOfWeek, isSameDay as df_isSameDay, getDate as df_getDate, addHours as df_addHours, isSameMonth as df_isSameMonth, setDay as df_setDay, getISOWeek as df_getISOWeek, setMonth as df_setMonth, addYears as df_addYears, isSameYear as df_isSameYear, getYear as df_getYear, startOfMonth as df_startOfMonth, getDay as df_getDay, subDays as df_subDays, getDaysInMonth as df_getDaysInMonth } from 'date-fns';

import PERIOD from './period.js';
import mixin from './mixin.js';
import findDataAttr from './findDataAttr.js';

export default {
	mixins: [mixin],
	props: {
		current: {
			type: Date,
			required: true,
		},
		view: {
			type: Number,
			required: true,
		},
		showOverlappingDays: {
			type: Boolean,
			default: true,
		},
	},
	computed: {
		today: function() {
			return new Date
		},

		viewLayout: function() {
			return {
				2: undefined,
				3: 'vertical',
				4: 'vertical',
				5: 'vertical',
				6: 'horizontal',
				7: 'horizontal',
				8: 'horizontal',
			}
		}
	},
	methods: {

		firstVisibleDayOfMonthView: function(date) {

			const startOfMonth = df_startOfMonth(date);
			const day = df_getDay(startOfMonth);

			return df_subDays(startOfMonth, (7 + day - this.firstDayOfTheWeek) % 7);
		},

		visibleWeeksCount: function(date) {

			const startOfMonth = df_startOfMonth(date);
			const day = df_getDay(startOfMonth);

			return Math.ceil((df_getDaysInMonth(date) + (7 + day - this.firstDayOfTheWeek) % 7) / 7);
		}
	},
	created: function() {

		Object.assign(this, { df_setMinutes, df_isSameMinute, df_format, df_setHours, df_isSameHour, df_addDays, df_startOfWeek, df_isSameDay, df_getDate, df_addHours, df_isSameMonth, df_setDay, df_getISOWeek, df_setMonth, df_addYears, df_isSameYear, df_getYear, df_startOfMonth, df_getDay, df_subDays, df_getDaysInMonth });
	}
}
</script>
