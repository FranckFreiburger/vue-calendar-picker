<template>
	<div style="user-select: none; display: inline-block">
		<calendar-events
			v-for="i in useTwoCalendars? 2 : 1"
			:key="i"
			:locale="locale"
			:compact="compact"
			:view-count="viewCount"
			:initial-view="initialView"
			:initial-current="initialCurrent"
			:selection="selection"
			:events="events"
			:item-class="itemClass"
			@action="action"
		></calendar-events>
	</div>
</template>

<script>

import { differenceInMilliseconds as df_differenceInMilliseconds, addMilliseconds as df_addMilliseconds, isBefore as df_isBefore, subMilliseconds as df_subMilliseconds, min as df_min, max as df_max } from 'date-fns';


import calendarEvents from './calendarEvents.vue';

export default {
	components: {
		calendarEvents: calendarEvents,
	},
	props: {
		locale: {},
		compact: {},
		viewCount: {},
		initialView: {},
		initialCurrent: {},
		events: {},
		itemClass: {},
		
		selection: {
			type: Object,
			required: true,
		},
		useTwoCalendars: {
			type: Boolean,
			default: false,
		}
	},
	data: function() {
		return {
			ref: null,
		}
	},
	methods: {
		action: function(ev) {

			if ( ev.eventType === 'down' && 'range' in ev ) {
				
				if ( ev.keyActive ) {
					
					var rangeLength = df_differenceInMilliseconds(ev.range.end, ev.range.start);
					var midRange = df_addMilliseconds(ev.range.start, rangeLength/2);
					var midSel = df_addMilliseconds(this.selection.start, df_differenceInMilliseconds(this.selection.end, this.selection.start)/2);

					if ( df_isBefore(midRange, midSel) ) {

						this.ref = { start: df_subMilliseconds(this.selection.end, rangeLength), end: this.selection.end }
						this.selection.start = df_min(ev.range.start, this.ref.start);
					} else {

						this.ref = { start: this.selection.start, end: df_addMilliseconds(this.selection.start, rangeLength) }
						this.selection.end = df_max(ev.range.end, this.ref.end);
					}
					return;
				}

				this.ref = ev.range;
			}

			if ( ev.eventType === 'up' )
				this.ref = null;

			if ( ev.eventType === 'over' && ev.pointerActive && 'range' in ev ) {
				
				if ( this.ref ) {
					
					this.selection.start = df_min(ev.range.start, this.ref.start);
					this.selection.end = df_max(ev.range.end, this.ref.end);
					return;
				}
			}

			this.$emit('action', ev);
		}
	}
}
</script>
