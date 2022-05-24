import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// TODO fix date, timezone issue
// currently we store datetime as local datetime(UTC+5:30) in db
// without timezone info

dayjs.extend(utc);

// use this while reading date from DB
function dayjsUTC(datetimeObj) {
  return dayjs.utc(datetimeObj);
}

// use this when sending date to DB
function dayjsLocal(datetimeObj) {
  return dayjs(datetimeObj);
}

export { dayjsUTC, dayjsLocal };
