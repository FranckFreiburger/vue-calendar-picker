<template>
	<calendar
		:locale="locale"
		:compact="compact"
		:initialView="initialView"
		:initialCurrent="initialCurrent"
		:item-class="thisItemClass"

		:events="events"
		:selection="selection"
		@action="action"
	>
		<template scope="p">
			<div class="events">
				<div
					class="eventRange"
					v-for="event in events"
					v-if="!df.isEqual(event.start, event.end) && df.areRangesOverlapping(event.start, event.end, p.itemRange.start, p.itemRange.end)"
					:style="[ { backgroundColor: event.color }, eventStyle(event, p.itemRange, p.layout) ]"
				></div>
				<div
					class="eventAt"
					v-for="event in events"
					v-if="(!event.end || df.isEqual(event.start, event.end)) && df.isWithinRange(event.start, p.itemRange.start, p.itemRange.end)"
					:style="{ backgroundColor: event.color }"
				></div>
			</div>
		</template>
	</calendar>
</template>

<style>

/* events */

.calendar .view .events {
	display: inline-block;
}

.calendar .view .eventRange {
	display: inline-block;
}

.calendar .view .eventAt {
	display: inline-block;
	margin: 1px;
	width: 4px;
	height: 4px;
}


/* horizontal layout */

.calendar .timeHorizontal .events {
	width: 100%;
	vertical-align: top;
	text-align: center;
}

.calendar .timeHorizontal .eventRange {
	position: relative;
	display: block;
	margin: 2px 0;
	width: 100%;
	min-width: 1px;
	height: 2px;
}

.calendar .timeHorizontal .eventAt {
	vertical-align: top;
}


/* vertical layout */

.calendar .timeVertical .events {
	height: 100%;
}

.calendar .timeVertical .eventRange {
	position: relative;
	margin: 0 2px;
	width: 2px;
	height: 100%;
	min-height: 1px;
	vertical-align: top;
}

.calendar .timeVertical .eventAt {
	vertical-align: middle;
}


/* selection */

.calendar .selection2 {
	background-color: #cde;
}

.calendar .selection1 {
	background-color: #def;
}

</style>

<script>
"use strict";

var df = require('date-fns'); // https://date-fns.org

var calendar = require('./calendar.vue');

module.exports = {
	components: {
		calendar: calendar,
	},
	props: {
		locale: {},
		compact: {},
		initialView: {},
		initialCurrent: {},
		selection: {
			type: Object,
			default: function() {
				return {}
			}
		},
		itemClass: {
			type: Function,
			default: function() {},
		},
		events: {
			type: Array,
			default: []
		},
	},
	methods: {

		thisItemClass: function(range) {
			
			var classlist = [this.itemClass(range)];

			var start = this.selection.start;
			var end = this.selection.end;
			var start = df.min(start, end);
			var end = df.max(start, end);
			
			
			if ( !(df.isAfter(start, range.start) || df.isBefore(end, range.end)) )
				classlist.push('selection'+2);
			else
			if ( df.areRangesOverlapping(start, end, range.start, range.end) )
				classlist.push('selection'+1);
			
			return classlist;
		},
		
		eventStyle: function(event, itemRange, layout) {
			
			if ( event.start < itemRange.start && event.end > itemRange.end )
				return null; // use default style aka 100%

			var itemLength = itemRange.end - itemRange.start;
			
			var start = df.max(event.start, itemRange.start);
			var end = df.min(event.end, itemRange.end);
			
			var offset = (start - itemRange.start) / itemLength;
			var size = (end - itemRange.start) / itemLength - offset;
			
			var uiOffset = offset*100+'%';
			var uiSize = size > 0.1 ? size*100+'%' : '2px';

			if ( layout === 'horizontal' )
				return { left: uiOffset, width: uiSize };
			else
				return { top: uiOffset, height: uiSize };
		},
	
		action: function(type, mouseActive, keyActive, range, rangeType) {
			
			this.$emit('action', type, mouseActive, keyActive, range, rangeType);
		}	
	},
	created: function() {

/*
		this.dateIsSame = function(d1, d2, type) {
			
			switch (type) {
				case 'hour': return df.isSameHour(d1, d2);
				case 'day': return df.isSameDay(d1, d2);
				case 'week': return df.isSameWeek(d1, d2);
				case 'month': return df.isSameMonth(d1, d2);
				case 'year': return df.isSameYear(d1, d2);
			}
		}
*/
/*
		this.isWithinRangeExcludeEnd = function(dirtyDate, dirtyStartDate, dirtyEndDate) {
			
			return df.isWithinRange(dirtyDate, dirtyStartDate, dirtyEndDate) && !df.isEqual(dirtyDate, dirtyEndDate);
		}
*/
		this.df = df;
	}
}
</script>