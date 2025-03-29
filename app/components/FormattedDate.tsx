import { format } from 'date-fns';

type DateProps = {
    dateString: string | number | Date;
};


function FormattedDate({ dateString }: DateProps) {
    let date: Date;

    if (typeof dateString === 'number' || typeof dateString === 'string') {
        date = new globalThis.Date(dateString);
    } else {
        date = dateString;
    }

    if (isNaN(date?.getTime())) return <span>Invalid Date</span>;

    return <time dateTime={date.toISOString()}>{format(date, 'MMMM d, yyyy')}</time>;
}

export default FormattedDate