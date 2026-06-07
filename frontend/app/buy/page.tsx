import { redirect } from 'next/navigation';

/** Legacy route — sale discovery lives on Listings with For Sale filter. */
export default function BuyRedirectPage() {
  redirect('/properties?listingType=SALE');
}
