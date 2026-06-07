import { redirect } from 'next/navigation';

/** Legacy route — rental discovery lives on Listings with For Rent filter. */
export default function RentRedirectPage() {
  redirect('/properties?listingType=RENT');
}
