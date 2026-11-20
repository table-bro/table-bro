import type {PageServerLoad} from './$types';
import {prerenderOrders}     from '#lib/server/prerender-table';

export const load: PageServerLoad = () => ({prerendered: prerenderOrders()});
