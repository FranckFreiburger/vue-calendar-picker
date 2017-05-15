# vue-calendar-picker
Calendar component

![vue-calendar-picker screenshot](https://cloud.githubusercontent.com/assets/25509586/26058700/40d539be-397f-11e7-86ad-d0af0f21e64d.png)

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
* display one-time events and date/time period
* date/time period selection
* touch screen support
* only one dependancy: [date-fns](https://date-fns.org/), Modern JavaScript date utility library

`vue-calendar-picker` has 3 available components:
* `calendar.vue`: simple calendar
* `calendarEvents.vue`: `calendar.vue` + one-time events and date/time periods
* `calendarRange.vue`: `calendarEvents.vue` + range selection


## API - `calendar.vue`

### UI
* click on date part in the calendar header area to modify it (zoom out)
* click or double-click on the cell to zoom in. (from month view, use double-click to zoom in)

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

### UI
* event range are colored lines
* event point are dots

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

#### *default slot* <sup>scope: itemRange, layout / default: *empty*</sup>
The content of calendar cells.

##### `itemRange` <sup>`{ start: Date, end: Date }`</sup>
The time range of the the cell.

##### `layout` <sup>string</sup>
The layout of the content, either `'horizontal'` or `'vertical'`.


## API - `calendarEvents.vue`

### Properties

#### :locale - see [calendar.vue](#api---calendarvue) API.
#### :compact - see [calendar.vue](#api---calendarvue) API.
#### :initialView - see [calendar.vue](#api---calendarvue) API.
#### :initialCurrent - see [calendar.vue](#api---calendarvue) API.
#### :itemClass - see [calendar.vue](#api---calendarvue) API.

#### :events <sup>Array for `{ color: CSS color, start: Date, end: Date }`</sup>
A list of one-time events and date/time periods to display in the calendar.  
One-time events has the same `start` and `end` date.

#### :selection <sup>`{ start: Date, end: Date }`</sup>
The current calendar selection. For display only.

### Events

#### @action - see [calendar.vue](#api---calendarvue) API.



## API - `calendarRange.vue`

Allow user selection.  
The `selection` property object is modified according to the user's selection.  

### UI
* use mousedow + move or tap + move to select a range (also across calendars)
* use ctrl + click to update the selection (disbled on touch screens)


### Properties

#### :locale - see [calendar.vue](#api---calendarvue) API.
#### :compact - see [calendar.vue](#api---calendarvue) API.
#### :initialView - see [calendar.vue](#api---calendarvue) API.
#### :initialCurrent - see [calendar.vue](#api---calendarvue) API.
#### :itemClass - see [calendar.vue](#api---calendarvue) API.

#### :events - see [calendarEvents.vue](#api---calendareventsvue) API.
#### :selection - see [calendarEvents.vue](#api---calendareventsvue) API.

#### :useTwoCalendars <sup>boolean, default: `false`</sup>
Display two calendars side-by-side to make selection easier.


### Events

#### @action - see [calendarEvents.vue](#api---calendareventsvue) API.



## Example - advanced
```vue
<template>
    <calendar-range :events="calendarEvents" :selection="calendarSelection"></calendar-range>
</template>

<script>

import {calendarRange} from 'vue-calendar'

export default {
    components: {
        calendarRange: calendarRange
    },
    data() {
        return {
            calendarEvents: [
                // periods
                { color:'#aaf', start: new Date(2016, 9, 5, 0,0,0,0), end: new Date(2017, 4, 15, 0,0,0,0) },
                { color:'#afa', start: new Date(2016, 9, 5, 0,0,0,0), end: new Date(2017, 4, 13, 0,0,0,0) },
                { color:'#faa', start: new Date(2017, 4, 8, 12,30, 0,0), end: new Date(2017, 4, 9, 6,30, 0,0) },
                // one-time
                { color:'#faa', start: new Date(2017, 4, 2, 0,0,0,0), end: new Date(2017, 4, 2, 0,0,0,0) },
                { color:'#aaa', start: new Date(2017, 4, 2, 0,0,0,0), end: new Date(2017, 4, 2, 0,0,0,0) },
            ],
            calendarSelection: {
                start: new Date(2017, 4, 2), end: new Date(2017, 4, 7, 12)
            }
        }
    }
}
</script>

```

## Demo

![vue-calendar-picker demo](https://cloud.githubusercontent.com/assets/25509586/26059550/7863fa02-3982-11e7-8a20-83f77dbfe4de.gif)



## Credits
[<img src="https://www.franck-freiburger.com/FF.png" width="16"> Franck Freiburger](https://www.franck-freiburger.com)
