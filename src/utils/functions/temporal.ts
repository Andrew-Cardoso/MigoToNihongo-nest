import { Temporal } from '@js-temporal/polyfill';

export const TIME_ZONE = 'America/Sao_Paulo';

export const getDateNow = () => Temporal.Now.plainDateTimeISO(TIME_ZONE);