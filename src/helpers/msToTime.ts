export const DAY = 86400000;
export const HOUR = 3600000;
export const MINUTE = 60000;
export const SECOND =  1000;

export function msToTime(ms: number) {
  let days = Math.floor(ms / DAY);
  ms -= days * DAY;
  let hours = Math.floor(ms / HOUR);
  ms -= hours * HOUR;
  let minutes = Math.floor(ms / MINUTE);
  ms -= minutes * MINUTE;
  let seconds = Math.floor(ms / SECOND);
  ms -= seconds * SECOND;

  let text = '';
  if (days) {
    let str = text ? withZeroes(days) : String(days);
    text += str + 'd ';
  }
  if (hours || text) {
    let str = text ? withZeroes(hours) : String(hours);
    text += str + 'h ';
  }

  if (minutes || text) {
    let str = text ? withZeroes(minutes) : String(minutes);
    text += str + 'm ';
  }

  if (seconds || text) {
    let str = text ? withZeroes(seconds) : String(seconds);
    text += str + 's ';
  }

  if (ms || text) {
    let str = text ? withZeroes(ms, 3) : String(ms);
    text += str;
    return text;
  } else {
    return '0';
  }
}

function withZeroes(num: number, digits: number = 2) {
  let str = String(num);
  while (str.length < digits) {
    str = '0' + str;
  }

  return str;
}
