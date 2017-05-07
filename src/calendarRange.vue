<template>
	<div class="range">
		<calendar-events :compact="compact" :ranges="ranges" :selection="selection" @action="actionLeft"></calendar-events><!--
	 --><calendar-events :compact="compact" :ranges="ranges" :selection="selection" @action="actionRight"></calendar-events>
	 <div>{{selection.start.toString()}}</div>
	 <div>{{selection.end.toString()}}</div>
	</div>
</template>

<style scoped>

	.range {
		user-select: none;
	}

</style>

<script>
"use strict";

var df = require('date-fns'); // https://date-fns.org

var calendarEvents = require('./calendarEvents.vue');

module.exports = {
	components: {
		calendarEvents: calendarEvents,
	},
	props: {
		compact: {
		},
		ranges: {
		},
		selection: {
			type: Object,
			required: true,
		}
	},
	methods: {
		actionLeft: function(type, active, range, rangeType) {
			
			if ( type === 'mouseup' || type === 'mouseover' && active ) {
				
				this.selection.start = range.start;
			}
		},
		actionRight: function(type, active, range, rangeType) {
			
			if ( type === 'mouseup' || type === 'mouseover' && active ) {
				
				this.selection.end = range.end;
			}
		},
	}
}
</script>