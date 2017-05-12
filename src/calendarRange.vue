<template>
	<div style="user-select: none">
		<calendar-events :compact="compact" :ranges="ranges" :selection="selection" @action="actionLeft"></calendar-events><!--
	 --><calendar-events :compact="compact" :ranges="ranges" :selection="selection" @action="actionRight"></calendar-events>
	</div>
</template>

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
			ref: null,
		}
	},
	methods: {
		action: function(side, type, mouseActive, keyActive, range, rangeType) {

			if ( type === 'mousedown' ) {
				
				if ( keyActive ) {
					
					var rangeLength = df.differenceInMilliseconds(range.end, range.start);
					var midRange = df.addMilliseconds(range.start, rangeLength/2);
					var midSel = df.addMilliseconds(this.selection.start, df.differenceInMilliseconds(this.selection.end, this.selection.start)/2);

					if ( df.isBefore(midRange, midSel) ) {

						this.ref = { start: df.subMilliseconds(this.selection.end, rangeLength), end: this.selection.end }
						this.selection.start = df.min(range.start, this.ref.start);
					} else {

						this.ref = { start: this.selection.start, end: df.addMilliseconds(this.selection.start, rangeLength) }
						this.selection.end = df.max(range.end, this.ref.end);
					}
					return;
				}

				this.ref = range;
			}

			if ( type === 'mouseup' )
				this.ref = null;

			if ( type === 'mouseover' && mouseActive ) {
				
				if ( this.ref ) {
					
					this.selection.start = df.min(range.start, this.ref.start);
					this.selection.end = df.max(range.end, this.ref.end);
					return;
				}
			}
			
			this.$emit('action', type, mouseActive, keyActive, range, rangeType);
		},
		actionLeft: function(type, mouseActive, keyActive, range, rangeType) {
			this.action('left', type, mouseActive, keyActive, range, rangeType);
		},
		actionRight: function(type, mouseActive, keyActive, range, rangeType) {
			this.action('right', type, mouseActive, keyActive, range, rangeType);
		}
	}
}
</script>
