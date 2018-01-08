import isEq from './isEq.js';

import { format as df_format, addMinutes as df_addMinutes, addHours as df_addHours, addDays as df_addDays, addWeeks as df_addWeeks, addMonths as df_addMonths, addYears as df_addYears, startOfMinute as df_startOfMinute, startOfHour as df_startOfHour, startOfDay as df_startOfDay, startOfWeek as df_startOfWeek, startOfMonth as df_startOfMonth, startOfYear as df_startOfYear, getYear as df_getYear } from 'date-fns';
import PERIOD from './period.js';
import pointerEventDirective from './pointerEventDirective.js';


function data(el, binding) {

	if ( isEq(binding.value, binding.oldValue) )
		return;
	// use setAttribute instead of dataset because IE[9, 10] does not reflect dataset into dom attributes.
	el.setAttribute('data-'+binding.arg, JSON.stringify(binding.value));
}

function normalizeLocale(locale) {

	if ( locale.length === 2 )
		return locale+'-'+locale;
	return locale;
}

export default {
	directives: {
		data: data,
		onpointer: pointerEventDirective(),
	},
	
	props: {
		locale: {
			type: String,
			default: process.env.VUE_ENV === 'server' ? '' : normalizeLocale(navigator.language || navigator.userLanguage),
//			validator: function(value) {
//				
//				return value === value.toUpperCase();
//			},
			required: process.env.VUE_ENV === 'server'
		},
		compact: {
			type: Boolean,
			default: false,
		},
		
		itemClass: {
			type: Function,
			default: function() {},
		},

	},
	computed: {
		dateFnsLocale: function() {
			
			const lang = this.locale.substr(0,2).toLowerCase();
			return require('date-fns/locale/'+lang+'/index.js');
		},

		firstDayOfTheWeek: function() {

			const country = this.locale.substr(3,2).toUpperCase();
					
			if (' GB AG AR AS AU BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IE IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP NZ PA PE PH PK PR PY SA SG SV TH TN TT TW UM US VE VI WS YE ZA ZW '.indexOf(' '+country+' ') !== -1 )
				return 0; // sun
			if (' AE AF BH DJ DZ EG IQ IR JO KW LY MA OM QA SD SY '.indexOf(' '+country+' ') !== -1 )
				return 6; // sat
			if (' BD MV '.indexOf(' '+country+' ') !== -1 )
				return 5; // fri
			return 1; // mon
		},

		dfOptions: function() {
			return { weekStartsOn: this.firstDayOfTheWeek };
		},
		
	},
	methods: {
		format: function(date, format) {

			return df_format(date, format, { locale: this.dateFnsLocale });
		},
		
		dateAdd: function(date, type, count) {
			
			switch ( type ) {
				case PERIOD.MINUTE: return df_addMinutes(date, count);
				case PERIOD.HOUR: return df_addHours(date, count);
				case PERIOD.DAY: return df_addDays(date, count);
				case PERIOD.WEEK: return df_addWeeks(date, count);
				case PERIOD.MONTH: return df_addMonths(date, count);
				case PERIOD.YEAR: return df_addYears(date, count);
				case PERIOD.DECADE: return df_addYears(date, 16 * count);
			}
		},
		
		getItemRange: function(date, type) {
			
			switch ( type ) {
				case PERIOD.MINUTE: return { start: df_startOfMinute(date), end: df_startOfMinute(df_addMinutes(date, 1)) };
				case PERIOD.HOUR: return { start: df_startOfHour(date), end: df_startOfHour(df_addHours(date, 1)) };
				case PERIOD.DAY: return { start: df_startOfDay(date), end: df_startOfDay(df_addDays(date, 1)) };
				case PERIOD.WEEK: return { start: df_startOfWeek(date, this.dfOptions), end: df_startOfWeek(df_addWeeks(date, 1), this.dfOptions) };
				case PERIOD.MONTH: return { start: df_startOfMonth(date), end: df_startOfMonth(df_addMonths(date, 1)) };
				case PERIOD.YEAR: return { start: df_startOfYear(date), end: df_startOfYear(df_addYears(date, 1)) };
				case PERIOD.DECADE: return { start: df_getYear(date)-9 , end:df_getYear(date)+6 };
			}
		},
		
	},
	
	created: function() {
		
		this.PERIOD = PERIOD;
	}
	
}
