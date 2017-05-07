<template>
	<calendar :ranges="ranges" :selection="selection" @action="action">
		<template scope="p">
			<div class="events">
				<div
					class="eventRange"
					v-for="event in ranges"
					v-if="!df.isEqual(event.start, event.end) && isWithinRangeExcludeEnd(p.arg, event.start, event.end)"
					:style="{ backgroundColor: event.color }"
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

		this.isWithinRangeExcludeEnd = function(dirtyDate, dirtyStartDate, dirtyEndDate) {
			
			return df.isWithinRange(dirtyDate, dirtyStartDate, dirtyEndDate) && !df.isEqual(dirtyDate, dirtyEndDate);
		}

		this.df = df;
	}
}
</script>