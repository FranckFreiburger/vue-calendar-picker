<template>
	<div class="header">
		<span v-if="$parent.view <= $parent.PERIOD.YEAR" :data-view="$parent.PERIOD.DECADE" v-text="df_getYear($parent.current)"></span>
		<span v-if="$parent.view <= $parent.PERIOD.MONTH" :data-view="$parent.PERIOD.YEAR" v-text="$parent.format($parent.current, $parent.compact ? 'MMM' : 'MMMM')"></span>
		<span v-if="$parent.view === $parent.PERIOD.WEEK" :data-view="$parent.PERIOD.MONTH" v-text="'W'+df_getISOWeek($parent.current)"></span>
		<span v-if="$parent.view <= $parent.PERIOD.DAY" :data-view="$parent.PERIOD.MONTH" v-text="df_getDate($parent.current)"></span>
		<span v-if="$parent.view <= $parent.PERIOD.HOUR" :data-view="$parent.PERIOD.DAY">{{$parent.format($parent.current, 'HH')}}<sup>h</sup></span>
	</div>
</template>


<script>

import { getYear as df_getYear, getISOWeek as df_getISOWeek, getDate as df_getDate } from 'date-fns';

export default {
	created: function() {

		Object.assign(this, { df_getYear, df_getISOWeek, df_getDate });
	}
}
</script>
