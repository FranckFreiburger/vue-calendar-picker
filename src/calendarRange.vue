<template>
	<div class="range">
		<calendar-events :compact="compact" :ranges="ranges" :selection="selection" @action="action"></calendar-events><!--
	 --><calendar-events :compact="compact" :ranges="ranges" :selection="selection" @action="action"></calendar-events>
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
	data: function() {
		return {
			selectStart: null
		}
	},
	methods: {
		action: function(type, mouseActive, keyActive, range, rangeType) {

			if ( type === 'mousedown' ) {
				
				if ( !keyActive ) {
					
					this.selectStart = range;
				} else {
					
					if ( Math.abs(df.differenceInMilliseconds(range.start, this.selection.start)) < Math.abs(df.differenceInMilliseconds(range.end, this.selection.end)) )
						this.selection.start = range.start;
					else
						this.selection.end = range.end;
					return;
				}
			}

			if ( type === 'mouseup' )
				this.selectStart = null;

			if ( type === 'mouseover' && mouseActive ) {
				
				if ( this.selectStart ) {
					
					this.selection.start = df.min(range.start, this.selectStart.start);
					this.selection.end = df.max(range.end, this.selectStart.end);
					return;
				}
				
				if ( keyActive ) {

					if ( Math.abs(df.differenceInMilliseconds(range.start, this.selection.start)) < Math.abs(df.differenceInMilliseconds(range.end, this.selection.end)) )
						this.selection.start = range.start;
					else
						this.selection.end = range.end;
					return;
					
				}

			}
			
			this.$emit('action', type, mouseActive, keyActive, range, rangeType);

		}
	}
}
</script>