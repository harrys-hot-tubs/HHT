import moment from "moment";
import { useState } from "react";
import { DateRangePicker, FocusedInputShape } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";

const Calendar = () => {
  moment.locale("en-GB");
  const [startDate, setStartDate] = useState<moment.Moment>();
  const [endDate, setEndDate] = useState<moment.Moment>();
  const [focused, setFocused] = useState<FocusedInputShape>(null);

  const isDayBlocked = (day: moment.Moment): boolean => {
    const blockedDates = [moment("2021-02-26")];
    return blockedDates.some((blockedDate) => blockedDate.isSame(day, "D"));
  };
  return (
    <DateRangePicker
      startDate={startDate}
      startDateId="ad"
      endDate={endDate}
      endDateId=""
      onDatesChange={({ startDate, endDate }) => {
        console.log("startDate", startDate);
        console.log("endDate", endDate);
        if (startDate) setStartDate(startDate);
        if (endDate) setEndDate(endDate);
      }}
      focusedInput={focused}
      onFocusChange={setFocused}
      isDayBlocked={isDayBlocked}
    />
  );
};

export default Calendar;
