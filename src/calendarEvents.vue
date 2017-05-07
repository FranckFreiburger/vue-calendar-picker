<template>
	<calendar :ranges="ranges" :selection="selection" @action="action">
		<template scope="p">
			<div class="events">
				<div
					class="eventRange"
					v-for="event in ranges"
					v-if="!df.isEqual(event.start, event.end) && df.areRangesOverlapping(event.start, event.end, p.itemRange.start, p.itemRange.end)"
					:style="[ { backgroundColor: event.color }, eventStyle(event, p.itemRange, p.layout) ]"
				></div>
				<div
					class="eventAt"
					v-for="event in ranges"
					v-if="df.isEqual(event.start, event.end) && dateIsSame(p.arg, event.start, p.type)"
					:style="{ backgroundColor: event.color }"
				></div>
			</div>
		</template>
	</calendar>
</template>

<style scoped>

/* events */

.view .events {
	display: inline-block;
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
	position: relative;
	display: block;
	margin: 2px 0;
	width: 100%;
	height: 2px;
}

.timeHorizontal .eventAt {
}

.timeVertical .events {
	height: 100%;
}

.timeVertical .eventRange {
	position: relative;
	margin: 0 2px;
	width: 2px;
	height: 100%;
	vertical-align: top;
}

.timeVertical .eventAt {
	vertical-align: middle;
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
		compact: {
		},
		selection: {
		},
		ranges: {
			type: Array,
			default: []
		},
	},
	methods: {
		
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
	
		action: function(type, active, range, rangeType) {
			
			this.$emit('action', type, active, range, rangeType);
		}	
	},
	created: function() {

		this.dateIsSame = function(d1, d2, type) {
			
			switch (type) {
				case 'hour': return df.isSameHour(d1, d2);
				case 'day': return df.isSameDay(d1, d2);
				case 'week': return df.isSameWeek(d1, d2);
				case 'month': return df.isSameMonth(d1, d2);
				case 'year': return df.isSameYear(d1, d2);
			}
		}
/*
		this.isWithinRangeExcludeEnd = function(dirtyDate, dirtyStartDate, dirtyEndDate) {
			
			return df.isWithinRange(dirtyDate, dirtyStartDate, dirtyEndDate) && !df.isEqual(dirtyDate, dirtyEndDate);
		}
*/
		this.df = df;
	}
}
</script>