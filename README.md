# vue-calendar-picker
Calendar component

## Browser support
Same browser support as [Vue.js 2](https://github.com/vuejs/vue/blob/dev/README.md)

## Example - basic
```vue
<template>
    <calendar></calendar>
</template>

<script>

import {calendar} from 'vue-calendar'

export default {
    components: {
        calendar: calendar
    }
}

</script>

```

## Install
```
npm install --save vue-calendar-picker
```

## Features
* zoom from decade view to hour view (decade, year, month, week, day, hour)
* localized (see [supported locale list](https://github.com/date-fns/date-fns/tree/master/src/locale))
* autodetect the first day of the week
* animated (zoom & slide)
* display One-time events and date/time period
* date/time period selection
* touch screen support
* only one dependancy: [date-fns](https://date-fns.org/), Modern JavaScript date utility library

vue-calendar-picker has 3 available components:
* `calendar.vue`: simple calendar
* `calendarEvents.vue`: `calendar.vue` + one-time events and date/time periods
* `calendarRange.vue`: `calendarEvents.vue` + range selection


## API - `calendar.vue`

### Properties

#### :locale <sup>string, default: navigator.language<sup>
The locale of the calendar. Impacts the days names, month names and first day ofthe week. [supported locale list](https://github.com/date-fns/date-fns/tree/master/src/locale).
Locale name must be uppercase.

#### :compact <sup>boolean, default: false<sup>
Enable compact mode. Use less UI space.

#### :initialView <sup>number, default: 6 (month view)<sup>
Initial view zoom.

#### :initialCurrent <sup>Date, default: new Date<sup>
Initial view date.

#### :itemClass <sup>function(range), default: *empty function*<sup>
Called for each calendar cell. The retun valus is used as className of the cell.


### Events

#### @action <sup>(eventType, eventActive, keyActive, range, rangeType)</sup>

##### `eventType` <sup>string</sup>
* `'down'`: mousedown or touchstart
* `'up'`: mouseup or touchend
* `'tap'`: click
* `'press'`: dblclick or longtap
* `'over'`: mouseover or touchmove

##### `eventActive` <sup>boolean</sup>
Indicates that the pointer is active: a mouse button is down or the finger touches the screen.

##### `keyActive` <sup>boolean</sup>
Indicates that the shift or ctrl or alt or meta key is down. Always `false` on touch-screen devices.

##### `range` <sup>`{ start: Date, end: Date }`</sup>
The date range of the item

##### `rangeType` <sup>string</sup>
The range name: `'minute'`, `'hour'`, `'day'`, `'week'`, `'month'`, `'year'`, 



### Slots

#### *default slot* <sup>scope: itemRange, layout / default: **empty**</sup>
The content of calendar cells.

##### `itemRange` <sup>`{ start: Date, end: Date }`</sup>
The time range of the the cell.

##### `layout` <sup>string</sup>
The layout of the content, either `'horizontal'` or `'vertical'`.


## API - `calendarEvents.vue`

### Properties

#### :locale - see `calendar.vue` API.
#### :compact - see `calendar.vue` API.
#### :initialView - see `calendar.vue` API.
#### :initialCurrent - see `calendar.vue` API.
#### :itemClass - see `calendar.vue` API.

#### :events <sup>Array for `{ color: **CSS color**, start: Date, end: Date }`</sup>
A list of one-time events and date/time periods to display in the calendar.  
One-time events has the same `start` and `end` date or just no `end` date.

#### :selection <sup>`{ start: Date, end: Date }`</sup>
The current calendar selection. For display only.

### Events

#### @action - see `calendar.vue` API.



## API - `calendarRange.vue`

Allow user selection.  
The `selection` property object is modified according to the user's selection.

### Properties

#### :locale - see `calendar.vue` API.
#### :compact - see `calendar.vue` API.
#### :initialView - see `calendar.vue` API.
#### :initialCurrent - see `calendar.vue` API.
#### :itemClass - see `calendar.vue` API.

#### :events - see `calendarEvents.vue` API.
#### :selection - see `calendarEvents.vue` API.

#### :useTwoCalendars <sup>boolean, default: `false`</sup>
Display two calendars side-by-side to make selection easier.


### Events

#### @action - see `calendarEvents.vue` API.






## Credits
[<img src="https://www.franck-freiburger.com/FF.png" width="16"> Franck Freiburger](https://www.franck-freiburger.com)
